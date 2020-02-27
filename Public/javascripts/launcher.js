$(document).ready(function() {
    
    parseCookies();
    
    var authWait = setInterval(function() {

    parseCookies();
    
        if (getCookie("access_token", "") != "") { $("#launch").prop("disabled", false); $("#link").html(baseUri + "app.html" + SettingsToString() + "&token=" + getCookie("access_token", "")); }
    }, 250);
    
    if (getCookie("currentBoss", "") != "")
    {
        $("#display-name").val(getCookie("currentBoss", ""));
    }
    if(getCookie("currentHp", "") != "")
    {
        $("#hp-current").val(getCookie("currentHp", ""));
    }
    if(getCookie("maxHp", "") != "")
    {
        $("#hp-maximum").val(getCookie("maxHp", ""));
    }

    var appWindow = null;

    function LaunchAuth() {

        window.open("https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=" + clientId + "&redirect_uri=" + redirectUri + "&scope=user_read bits:read channel:read:redemptions channel_subscriptions", "", "width=400,height=512");
    }
    function LaunchForce() {

        window.open("https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=" + clientId + "&redirect_uri=" + redirectUri + "&scope=user_read bits:read channel:read:redemptions channel_subscriptions&force_verify=true", "", "width=400,height=512");
    }
    function LaunchApp() {

        appWindow = window.open("./app.html", "App", "width=350px,height=100");
    }
    function LaunchDemo() {

        appWindow = window.open("./demo.html", "Demo", "width=350,height=325");
    }
    function Reset() {

        setCookie("currentBoss", "");
        setCookie("currentHp", "0");
        setCookie("access_token", "");
        $("#launch").prop("disabled", true);
        $("#link").html("<span style='color: red;'>App not yet authorized. Authorize the app to get a link.</span>");
    }
    
    function SetBitBoss() {
        hp_amount = $("#hp-current").val();
        max_hp_amount = $("#hp-maximum").val();
        display_Name = $("#display-name").val();
        setCookie("currentBoss", display_Name);
        setCookie("currentHp", hp_amount);
        setCookie("maxHp", max_hp_amount);
    }

    function SettingsToString() {
        
        return "?sound=" + getCookie("sound", "false") + "&trans=" + getCookie("trans", "false") + "&chroma=" + getCookie("chroma", "false") + "&persistent=" + getCookie("persistent", "false") + "&bossheal=" + getCookie("bossheal", "false") + "&hptype=" + getCookie("hptype", "overkill") + "&hpmult=" + getCookie("hpmult", "1") + "&hpinit=" + getCookie("hpinit", "1000") + "&hpamnt=" + getCookie("hpamnt", "1000");
    }
    
    $("#auth").click(LaunchAuth);
    $("#force").click(LaunchForce);
    $("#launch").click(LaunchApp);
    $("#demo").click(LaunchDemo);
    $("#reset").click(Reset);
    $("#setBoss").click(SetBitBoss);
});