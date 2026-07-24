export const environment = {
    production: true,
    googleMapKey:"AIzaSyBb5jBpNLfyeBqj_tjhB1r4sexvqUVZx6s",
    firebase: {
        apiKey: "AIzaSyBduY6Or0tHP8DALAMwrWxpo_tNKpgf7Ls",
        authDomain: "my-memo-3a2c4.firebaseapp.com",
        databaseURL: "https://my-memo-3a2c4-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "my-memo-3a2c4",
        storageBucket: "my-memo-3a2c4.firebasestorage.app",
        messagingSenderId: "639616505173",
        appId: "1:639616505173:web:99c36a725a46a2bbf1cbdc",
        measurementId: "G-1H60CMJSJR"
    },
    // 프로덕션 환경에서 console.* 함수를 비활성화
    disableConsoleLog: () => {
        if (environment.production) {
            // console의 모든 메서드를 빈 함수로 대체
            console.log = function() {};
            console.warn = function() {};
            // console.error = function() {};
            console.info = function() {};
            // 다른 console 메서드도 필요에 따라 추가
        }
    }    
}

