const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

// ✅ Python 실행 파일 경로 설정 (Windows 호환)
const PYTHON_EXECUTABLE = process.platform === "win32" ? "python" : "python3";

// ✅ Python 스크립트 경로 설정 (절대경로 사용 가능)
const pythonScriptPath = path.resolve(__dirname, "../python/GPT_Neo/chatbot_server.py");

// ✅ Python 파일이 존재하는지 확인
if (!fs.existsSync(pythonScriptPath)) {
    console.error(`🚨 오류: Python 스크립트를 찾을 수 없습니다! 경로 확인: ${pythonScriptPath}`);
    process.exit(1);
}

// ✅ Python 실행 프로세스 생성 (한 번 실행 후 유지됨)
const pythonProcess = spawn(PYTHON_EXECUTABLE, [pythonScriptPath], {
    cwd: path.dirname(pythonScriptPath),
    stdio: ["pipe", "pipe", "pipe"], // stdin, stdout, stderr 연결
    env: { ...process.env, PYTHONUTF8: "1" }, // ✅ UTF-8 강제 적용
});

// ✅ Python 실행 여부 확인
console.log(`📢 Python 실행 시도: ${pythonScriptPath}`);

// ✅ Python의 stderr (디버깅 메시지) 확인
pythonProcess.stderr.on("data", (data) => {
    const text = data.toString().trim();
    console.error(`🚨 Python Debug: ${text}`);

    // ✅ Python의 모델 로드 완료 메시지를 감지한 후 입력 시작
    if (text.includes("✅ 모델 로드 완료! 대기 중...")) {
        console.log("✅ Python이 완전히 실행되었습니다. 이제 입력을 받을 수 있습니다.");
        chatLoop();
    }
});

// ✅ 사용자 입력을 처리하기 위한 `readline` 인터페이스 생성
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// ✅ Python으로 메시지 보내는 함수
function sendMessageToPython(message) {
    return new Promise((resolve, reject) => {
        let outputData = "";

        // ✅ 여러 줄을 받을 수 있도록 stdout 이벤트 리스너 설정
        pythonProcess.stdout.on("data", (data) => {
            outputData += data.toString();
            
            if (outputData.endsWith("\n")) {  // ✅ 응답이 끝났음을 확인
                try {
                    const response = JSON.parse(outputData.trim());
                    resolve(response.response);
                } catch (error) {
                    reject(`❌ JSON 파싱 오류: ${error.message}`);
                }
            }
        });

        // Python에 메시지 전송
        console.log(`📨 Python으로 메시지 전송: ${message}`);
        pythonProcess.stdin.write(JSON.stringify({ message }) + "\n");
    });
}

// ✅ Python이 완전히 실행된 후에만 입력을 받도록 설정
function chatLoop() {
    rl.question("💬 입력: ", async (input) => {
        if (input.toLowerCase() === "exit") {
            console.log("👋 챗봇 종료.");
            pythonProcess.kill(); // Python 프로세스 종료
            rl.close();
            process.exit(0);
        }

        try {
            const response = await sendMessageToPython(input);
            console.log(`🤖 GPT 응답: ${response}`);
        } catch (error) {
            console.error("❌ 오류 발생:", error);
        }

        // 다시 입력 대기
        chatLoop();
    });
}
