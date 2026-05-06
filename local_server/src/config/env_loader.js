import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
// env_loader.js는 'config' 폴더 안에 있으므로, 두 단계 위로 올라가야 합니다.
const __dirname = path.dirname(__filename);
// local_server/.env 우선, 없으면 appnormal 루트 .env.local 사용
const envPath = path.join(__dirname, "../../.env");
const fallbackEnvPath = path.join(__dirname, "../../../.env.local");

dotenv.config({ path: envPath });
dotenv.config({ path: fallbackEnvPath });

console.log("✅ (env_loader.js) 환경 변수가 성공적으로 로드되었습니다.");
