$(document).ready(function () {
    
    // Demo Mode
    var demoMode = false;
    
    // Channel ID
    var channelId = "";
    
    // Settings
    var sound = false;

    // Boss vars
    var nextBoss = "BiffMasterZay";
    ActionManager.pauseProcessing = true;

    // Timeout and Interval handlers
    var frstDelay = null;
    var animDelay = null;
    

    // State indicators
    var isDelayed = false;
    var refill = false;
    var preload = true;
    
    // HP settings
    var hpType = "overkill";
    var hpMult = 1;
    var hpAmnt = 1000;
    var bossHeal = false;
    var bossCurrentlyWounded = false;
    
    // Wounded Mode
    var bossWoundedModeEnabled = false;
    var bossWoundedMultiplier = 1;
    var bossWoundedDuration = 1;
    var bossWoundedTimer;
    
    // HP variables
    var prevHp = 0;
    var hp = 0;
    var delayed = 0;
    var loss = 0;
    var overkill = null;
    
    parseCookies();
    
    if (GetUrlParameter("token") != null)
    {
        access_token = GetUrlParameter("token");
        sound = (GetUrlParameter("sound") == "true");
        if (GetUrlParameter("trans") == "true") { $(".allcontainer").css("background-color", "rgba(0,0,0,0)"); }
        if (GetUrlParameter("chroma") == "true") { $(".allcontainer").css("background-color", "#00f"); }
        
        hpType = GetUrlParameter("hptype") || hpType;
        hpMult = parseInt(GetUrlParameter("hpmult")) || hpMult;
        hpAmnt = (hpType == "overkill" ? parseInt(GetUrlParameter("hpinit")) || hpAmnt : parseInt(GetUrlParameter("hpamnt")) || hpAmnt);
        
        bossHeal = (GetUrlParameter("bossheal") == "true");

        bossWoundedModeEnabled = (GetUrlParameter("bosswounded") == "true");
        bossWoundedMultiplier = parseFloat(GetUrlParameter("bosswoundedmultiplier"));
        bossWoundedDuration = parseFloat(GetUrlParameter("bosswoundedduration"));
        
        if (GetUrlParameter("persistent") != "true" || GetUrlParameter("reset") == "true")
        {
            setCookie("currentBoss", "");
            setCookie("currentHp", "0");
            setCookie("auth", "");
            setCookie("sound", "");
            setCookie("trans", "");
            setCookie("chroma", "");
        }
    }
    else
    {
        access_token = getCookie("access_token", "");
        sound = (getCookie("sound", "") == "true");
        if (getCookie("trans", "") == "true") { $(".allcontainer").css("background-color", "rgba(0,0,0,0)"); }
        if (getCookie("chroma", "") == "true") { $(".allcontainer").css("background-color", "#00f"); }
        
        hpType = getCookie("hptype", "overkill");
        hpMult = parseInt(getCookie("hpmult", "1"));
        hpAmnt = (hpType == "overkill" ? parseInt(getCookie("hpinit", "") || hpAmnt) : parseInt(getCookie("hpamnt", "")) || hpAmnt);
        
        bossHeal = (getCookie("bossheal", "") == "true");
        bossWoundedModeEnabled = (getCookie("bosswounded", "") == "true");
        bossWoundedMultiplier = parseFloat(getCookie("bosswoundedmultiplier", ""));
        bossWoundedDuration = parseFloat(getCookie("bosswoundedduration", ""));

        if (getCookie("persistent", "false") != "true")
        {
            setCookie("currentBoss", "");
            setCookie("currentHp", "0");
        }
    }

    var cookieHp = parseInt(getCookie("maxHp", "0"));

    if (cookieHp != 0)
    {
        hpAmnt = cookieHp;
    }
    
    if (access_token == "") { $("body").html("<h1 style='color: red;'>ERROR. NO AUTH.</h1>"); return; }
    
    if (window.addEventListener)
    {
        window.addEventListener("message", RefreshSettings, false);

        function RefreshSettings(event) {

            if (event.data == "refreshsettings")
            {
                parseCookies(); sound = (getCookie("sound", "") == "true");
            }
        }
    }
    
    // Presentation Interface
    var bossPresentationInterface = new BossPresentationInterface(sound);

    nextBoss = getCookie("currentBoss", "");
    ActionManager.pauseProcessing = nextBoss != null
    prevHp = Math.min(parseInt(getCookie("currentHp", "0")), hpAmnt);

    $.ajax({
        url: "https://api.twitch.tv/helix/users",
        type: "GET",
        beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', "Bearer " + access_token); xhr.setRequestHeader('Client-Id', clientId); },
        success: function(data) {
            userInfo = data["data"][0];
            channelId = userInfo.id;
            if (nextBoss == "") 
            { 
                nextBoss = userInfo.display_name; 
                ActionManager.pauseProcessing = true;
                setCookie("currentBoss", nextBoss); 
            }

            Connect("wss://pubsub-edge.twitch.tv:443", function() {

                GetNewBoss();
                Listen(
                    ["channel-bits-events-v2." + channelId, "channel-points-channel-v1."+ channelId, "channel-subscribe-events-v1."+ channelId] , 
                    access_token, 
                    [ProcessBitEventData, ProcessChannelPointsEventData, ProcessSubscriberEventData]);
            });
        },
        error: function(data) {
            $("body").html("<h1 style='color: red;'>ERROR. FAILED STREAMER GET.</h1>");
        }
      });
    
    function ProcessBitEventData(eventMessage)
    {
        ActionManager.actions.push(new Action(InterpretBitEventData, eventMessage));
    }

    function ProcessChannelPointsEventData(eventMessage)
    {
        ActionManager.actions.push(new Action(InterpretChannelPointsEventData, eventMessage));
    }

    function ProcessSubscriberEventData(eventMessage)
    {
        ActionManager.actions.push(new Action(InterpretSubscriberEventData, eventMessage));
    }

    function InterpretSubscriberEventData(eventMessage) 
    {
        message = eventMessage.data.message;
        console.log(message);
        if (!message) { return; }
        if (!message.user_name) { return; }
        if (!message.sub_plan) { return; }

        var subBits = 0;
        // Convert subscription to bit
        switch(message.sub_plan)
        {
            case "Prime":
            case "1000":
                subBits = 500;
            case "2000":
                subBits = 1000;
            case "3000":
                subBits = 2500;
        }

        ApplyAttackBits(message.user_name, subBits, "cheer");
    }

    function InterpretBitEventData(eventMessage) {
        message = eventMessage.data;
        if (!message) { return; }
        if (!message.user_name) { return; }
        if (!message.bits_used) { return; }
        if (!message.context) { return; }

        ApplyAttackBits(message.user_name, message.bits_used, message.context);
    }

    function ApplyAttackBits(user_name, bits_used, context)
    {
        if (!user_name) { return; }
        if (!bits_used) { return; }
        if (!context) { return; }

        if (nextBoss == "")
        {
            GetUserInfo(message.user_name, function(info) 
            {
                if (info.displayName == $("#name").html())
                {
                    if (bossHeal)
                    {
                        Heal(bits_used, user_name, info.displayName);
                    }
                }
                else
                {
                    Strike(bits_used, user_name, info.displayName);
                }
            });
        }
    }

    function InterpretChannelPointsEventData(message) {
        if (!message) { return; }
        if (!message.data) { return; }
        if (!message.data.redemption) { return; }
        if (!message.type == "reward-redeemed") { return; }
        console.log(message);
        redemptionData = message.data.redemption
        message.context = "cheer";

        if(redemptionData.reward.title !== "Majestic Prod" && redemptionData.reward.title !== "Prod" )
        {
            return;
        }

        if(nextBoss == "")
        {
            GetUserInfo(redemptionData.user.login, function(info) {  
                
                pointCost = 0;
                if(redemptionData.reward.title == "Prod")
                {
                    pointCost += 5;
                }

                if(redemptionData.reward.title == "Majestic Prod")
                {
                    pointCost += 25;
                }

                if (info.displayName == $("#name").html())
                {
                    if(bossHeal)
                    {
                        Heal(pointCost, info.displayName, info.displayName, message.context);
                    }
                }
                else
                {
                    Strike(pointCost, info.displayName, info.displayName, message.context);
                }
            });
        }
    }
    
    function Heal(bit_points, healer, display, context) {
        
        if (nextBoss == "")
        {
            bossPresentationInterface.HealPresentation(display, bit_points, context);


            loss -= bit_points;
            setCookie("currentHp", Math.min(hp - loss, hpAmnt).toString());

            isDelayed = true;

            if (animDelay != null) { clearTimeout(animDelay); }

            if (frstDelay != null) { clearTimeout(frstDelay); }

            frstDelay = setTimeout(RunHpCalc, 1000);
        }
    }

    function Strike(amount, attacker, display, context) 
    {    
        if (nextBoss == "")
        {
            if(bossWoundedModeEnabled && bossCurrentlyWounded)
            {
                amount = Math.floor(amount * bossWoundedMultiplier);
            }

            bossPresentationInterface.StrikePresentation(amount, attacker, context)

            loss += amount;
            // Boss has been defeated!
            if (hp - loss <= 0)
            {
                overkill = loss - hp;
                prevHp = 0;
                
                console.log("Overkill: " + overkill.toString());
                
                nextBoss = attacker;
                ActionManager.pauseProcessing = true;
                
                setCookie("currentBoss", nextBoss);
                
                bossPresentationInterface.UpdateCounterFinalDisplay(display);
                
                if(bossWoundedModeEnabled)
                {
                    bossCurrentlyWounded = true;
                    bossPresentationInterface.StartWoundedAnimation();
                    
                    //position: relative; height: 32px; bottom: 0px;
                    bossWoundedTimer = null;
                    if(bossWoundedTimer) {
                        clearTimeout(bossWoundedTimer); //cancel the previous timer.
                        bossWoundedTimer = null;
                    }
                    bossWoundedTimer = setTimeout(function()
                    { 
                        bossCurrentlyWounded = false;
                        bossPresentationInterface.EndWoundedAnimation();
                    }, bossWoundedDuration * 1000);
                }

                if(hpType == "overkill")
                {
                    setCookie("currentHp", (overkill * hpMult < 100 ? 100 : overkill * hpMult));
                    setCookie("maxHp", (overkill * hpMult < 100 ? 100 : overkill * hpMult));
                }
                else
                {
                    setCookie("currentHp", hpAmnt.toString());
                    setCookie("maxHp", hpAmnt.toString());
                }
            }
            else
            {
                setCookie("currentHp", (hp - loss).toString());
            }

            isDelayed = true;

            if (animDelay != null) { clearTimeout(animDelay); }

            if (frstDelay != null) { clearTimeout(frstDelay); }

            frstDelay = setTimeout(RunHpCalc, 1000);
        }
    }
    
    function RunHpCalc() {
        
        hp = Math.min(Math.max(0, hp - loss), hpAmnt);
        
        if (loss == 0) { return; }
        else if (loss > 0)
        {
            bossPresentationInterface.RunHPPresentationForLoss(loss, hp, hpAmnt);
            animDelay = setTimeout(function() {

                isDelayed = false;
            }, 1000);

            loss = 0;
        }
        else if (loss < 0)
        {
            bossPresentationInterface.RunHPPresentationForGain(loss, hp, hpAmnt, delayed);

            animDelay = setTimeout(function() {
                isDelayed = false;
            }, 1000);
            
            loss = 0;
        }
    }

    function KillBoss() {
        preload = true;
        bossPresentationInterface.KillBossPresentation(GetNewBoss)
    }

    function GetNewBoss() {
        
        if (nextBoss == "") { return; }
        GetUserInfo(nextBoss, function(info) {
            
            bossPresentationInterface.GetNewBoss(nextBoss, info, function()
            {
                if (hpType == "overkill" && overkill != null)
                {
                    hpAmnt = (overkill * hpMult < 100 ? 100 : overkill * hpMult);
                }  
                refill = true;
                preload = false;
            });
        });
    }
    
    function GetUserInfo(username, callback) {
        
        if (username == "") { return; }
        if (!callback) { return; }

        $.ajax({
            url: "https://api.twitch.tv/helix/users?login=" + username,
            type: "GET",
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', "Bearer " + access_token); xhr.setRequestHeader('Client-Id', clientId); },
            success: function(data) {
                userInfo = data["data"][0];
                callback({ displayName: userInfo.display_name, logo: userInfo.profile_image_url });
            },
            error: function(data) {
                console.log("Error: " + status);
                console.log(response);
                $("body").html("<h1 style='color: red;'>ERROR. FAILED USER GET.</h1>");
            }
        });
    }

    function GetUrlParameter(sParam) {
        
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? null : sParameterName[1];
            }
        }
    }
    
    /////////////////////////////////////////////////////////////////////////////
    // Animation loop
    // Handles updating the display (shaking, health bar refilling, etc)
    /////////////////////////////////////////////////////////////////////////////
    setInterval(function() {
        if(refill)
        {
            if (prevHp == 0) { hp = Math.min(hpAmnt, hp + (hpAmnt / 60)); }
            else { hp = Math.min(prevHp, hp + (prevHp / 60)); }
            delayed = hp;

            bossPresentationInterface.UpdateCounterHealth(delayed, hpAmnt);
            bossPresentationInterface.UpdateHealth(hp, hpAmnt);

            if (hp == (prevHp == 0 ? hpAmnt : prevHp))
            {
                refill = false;
                nextBoss = "";
                ActionManager.pauseProcessing = false;
                bossPresentationInterface.UpdateHitDelay(delayed, hpAmnt, 1);
            }
        }

        if (!isDelayed && !refill && !preload)
        {
            if (delayed > hp)
            {
                delayed = Math.max(delayed - ((hpAmnt / 5) / 60), hp);
                if (nextBoss == "") { bossPresentationInterface.UpdateCounterHealth(delayed, hpAmnt); }
                bossPresentationInterface.UpdateHitDelay(delayed, hpAmnt, 0);

                if (delayed == 0)
                {
                    KillBoss();
                }
            }
            else if (delayed < hp)
            {
                delayed = Math.min(delayed + ((hpAmnt / 5) / 60), hp);
                bossPresentationInterface.UpdateCounterHealth(delayed, hpAmnt);
                bossPresentationInterface.UpdateHealth(delayed, hpAmnt);
                bossPresentationInterface.UpdateHitDelay(delayed, hpAmnt, 0);
            }
        }
    }, (1000/60));
});