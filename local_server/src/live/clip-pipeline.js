import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "./redis-keys.js";
import { unlinkSync, mkdirSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";

// 서비스 키가 필요한 스토리지 작업용 (Storage RLS 우회)
const SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const BUCKET = process.env.SUPABASE_S3_BUCKET || "recordings";
const CLIP_BUCKET = "clips";
const CLIP_BEFORE_SEC = 30; // 하이라이트 기준 앞 30초
const CLIP_AFTER_SEC = 30; // 하이라이트 기준 뒤 30초
const CLIP_DURATION = CLIP_BEFORE_SEC + CLIP_AFTER_SEC; // 60초

/**
 * 녹화 파일을 로컬 임시 경로로 다운로드
 *
 * @param {string} filePath  Supabase Storage 내 경로 (e.g. recordings/room/ts.mp4)
 * @returns {string} 로컬 임시 파일 경로
 */
const downloadLive = async (filePath) => {
  const { data, error } = await SupabaseClient.storage
    .from(BUCKET)
    .download(filePath);

  if (error)
    throw new Error(`HighlightClip 추출 녹화 다운로드 실패: ${error.message}`);

  //OS가 만들어 놓은 기존의 임시파일에 붙히기
  const tmpDir = join(tmpdir(), "clips");
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  const localPath = join(tmpDir, `recording-${Date.now()}.mp4`);
  const buf = Buffer.from(await data.arrayBuffer());

  const { writeFileSync } = await import("fs");
  writeFileSync(localPath, buf);

  console.log(
    `HighlightClip 추출 다운로드 완료: ${localPath} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`,
  );
  return localPath;
};

/**
 * FFmpeg로 특정 구간을 클립으로 추출
 * -c copy 를 사용해 재인코딩 없이 빠른 추출
 *
 * @param {string} inputPath   원본 로컬 파일 경로
 * @param {number} startSec    클립 시작 시간 (초, 영상 시작 기준)
 * @param {number} outputPath  출력 파일 경로
 * @returns {Promise<void>}
 */
const extractClip = (inputPath, startSec, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(Math.max(0, startSec))
      .setDuration(CLIP_DURATION)
      .outputOptions("-c copy") // 재인코딩 없이 스트림 복사 (빠름)
      .outputOptions("-avoid_negative_ts make_zero")
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) =>
        reject(new Error(`[FFmpeg] 추출 실패: ${err.message}`)),
      )
      .run();
  });
};

/**
 * 로컬 클립 파일을 Supabase Storage clips 버킷에 업로드
 *
 * @param {string} localPath    로컬 파일 경로
 * @param {string} storagePath  Storage 내 경로
 * @returns {string} 공개 URL
 */

const upload = async (ss) => {
  const { readFileSync } = await import("fs");
  const buffer = readFileSync(ss);
};

//로컬에서 하이라이트 부분만 추출한 클립 다시 supabase에 올리기
const uploadClip = async (localPath, storagePath) => {
  const { readFileSync } = await import("fs");
  const fileBuffer = readFileSync(localPath);

  const { error } = await SupabaseClient.storage
    .from(CLIP_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: "video/mp4",
      upsert: false,
    });

  if (error)
    throw new Error(`HighlightClip 추출 클립 업로드 실패: ${error.message}`);

  const { data } = SupabaseClient.storage
    .from(CLIP_BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
};

/**
 * 클립 메타데이터를 Supabase DB clips 테이블에 저장
 */
const saveClipToDB = async (roomName, clip) => {
  const { error } = await SupabaseClient.from("highlights").insert({
    room_name: roomName,
    type: clip.type,
    public_url: clip.publicUrl,
    storage_path: clip.storagePath,
    highlight_started_at: clip.highlightTimestamp,
  });

  if (error)
    throw new Error(`HighlightClip 추출 DB 저장 실패: ${error.message}`);
};

/**
 * 전체 클립 파이프라인 진입점
 * 1. Redis에서 하이라이트 목록 읽기
 * 2. 녹화 파일 다운로드
 * 3. 하이라이트 각각 FFmpeg로 클립 추출
 * 4. Supabase Storage 업로드
 * 5. DB 저장
 * 6. 임시 파일 정리, 원본 녹화 삭제
 *
 * @param {string} roomName
 * @param {string} highlightClipPath  Supabase Storage 내 녹화 파일 경로
 * @param {number} liveStartedDate  방송 시작한 날짜
 */
export const runExtractClips = async (
  roomName,
  highlightClipPath,
  liveStartedDate,
) => {
  console.log(`HighlightClip 추출 시작: ${roomName}`);

  const keys = getRedisKeys(roomName);
  const tempFiles = [];

  try {
    // 1. 하이라이트 목록 읽기-Redis로 부터
    const getHighlights = await redis_client.zRangeWithScores(
      keys.HIGHLIGHTS,
      0,
      -1,
    );

    if (!getHighlights || getHighlights.length === 0) {
      console.log(` ${roomName} 방의 하이라이트가 없음!`);
      return;
    }

    const highlights = getHighlights
      .map(({ value, score }) => {
        try {
          return { ...JSON.parse(value), timestamp: score };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    console.log(`${roomName} 하이라이트 ${highlights.length}개 발견`);

    // 2. 녹화 파일 다운로드(Storage)
    const localLiveFile = await downloadLive(highlightClipPath);
    tempFiles.push(localLiveFile);

    // 3. 각 하이라이트 → 클립 추출 + 업로드
    const extractedClips = [];

    for (const highlight of highlights) {
      try {
        // 하이라이트 시각을 방송 시작 기준 상대 시간(초)으로 변환
        const offsetMs = highlight.timestamp - liveStartedDate;
        const offsetSec = Math.max(0, Math.floor(offsetMs / 1000));
        const clipStartSec = Math.max(0, offsetSec - CLIP_BEFORE_SEC);

        const tmpDir = join(tmpdir(), "clips");
        const clipFilename = `${roomName}_${highlight.type}_${highlight.timestamp}.mp4`;
        const localClipPath = join(tmpDir, clipFilename);
        tempFiles.push(localClipPath);

        // FFmpeg 추출
        await extractClip(localLiveFile, clipStartSec, localClipPath);

        // 업로드
        const storagePath = `${roomName}/${clipFilename}`;
        const publicUrl = await uploadClip(localClipPath, storagePath);

        // DB 저장
        await saveClipToDB(roomName, {
          type: highlight.type,
          publicUrl,
          storagePath,
          startOffsetSec: clipStartSec,
          highlightTimestamp: highlight.timestamp,
        });

        extractedClips.push({ type: highlight.type, url: publicUrl });
        console.log(
          ` 클립 완료: ${highlight.type} @ ${offsetSec}s → ${publicUrl}`,
        );
      } catch (clipErr) {
        console.error(` 개별 클립 실패 (${highlight.type}):`, clipErr.message);
        // 하나 실패해도 나머지 계속 처리
      }
    }

    console.log(
      ` 완료: ${extractedClips.length}/${highlights.length}개 클립 저장`,
    );

    // 4. 원본 녹화 삭제 (Storage 용량 절약)
    const { error: delErr } = await SupabaseClient.storage
      .from(BUCKET)
      .remove([highlightClipPath]);

    if (delErr) {
      console.warn(` 원본 녹화 삭제 실패: ${delErr.message}`);
    } else {
      console.log(` 원본 녹화 삭제 완료: ${highlightClipPath}`);
    }
  } finally {
    // 5. 로컬 임시 파일 정리
    for (const f of tempFiles) {
      try {
        if (existsSync(f)) unlinkSync(f);
      } catch {}
    }
    console.log(` 임시 파일 ${tempFiles.length}개 정리 완료`);
  }
};
