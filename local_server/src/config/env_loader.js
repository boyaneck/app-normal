import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
// env_loader.js는 'config' 폴더 안에 있으므로, 두 단계 위로 올라가야 합니다.
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "../../.env");

dotenv.config({ path: envPath });

console.log("✅ (env_loader.js) 환경 변수가 성공적으로 로드되었습니다.");
