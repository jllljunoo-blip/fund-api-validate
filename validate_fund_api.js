// 文件名：validate_fund_api.js
// 用途：验证基金/指数/股票接口是否可用
// 运行示例：
// node validate_fund_api.js 110022    // 天天基金基金代码
// node validate_fund_api.js 1.000300  // 东方财富指数/股票代码

const fetch = require("node-fetch"); // Node 18+ 内置 fetch 可不写

const args = process.argv.slice(2);
if(args.length === 0){
    console.log("请提供基金/指数/股票代码");
    process.exit(1);
}

const code = args[0];

// 东方财富指数/股票接口
async function fetchEastMoney(code){
    try{
        const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${code}&fields=f43,f57,f62`;
        const res = await fetch(url);
        const data = await res.json();
        return data;
    }catch(e){
        return {error:"东方财富接口请求失败", msg:e.toString()};
    }
}

// 天天基金接口
async function fetchFund(code){
    try{
        const url = `http://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`;
        const res = await res.text();
        // 天天基金返回的是 js 回调函数，需要提取 JSON
        // 格式： jsonpgz({...});
        const match = res.match(/jsonpgz\((.*)\);/);
        if(match && match[1]){
            return JSON.parse(match[1]);
        } else {
            return {error:"解析天天基金返回失败"};
        }
    }catch(e){
        return {error:"天天基金接口请求失败", msg:e.toString()};
    }
}

(async ()=>{
    let output={};

    if(/^\d{6}$/.test(code)){
        // 6位数字 → 基金
        output.source="天天基金";
        output.data = await fetchFund(code);
    } else if(code.includes(".")){
        // 市场.代码 → 东方财富股票/指数
        output.source="东方财富";
        output.data = await fetchEastMoney(code);
    } else {
        output={error:"无法判断类型，请输入正确代码"};
    }

    console.log(JSON.stringify(output,null,2));
})();
