$(document).ready(function () {
    
    // Demo Mode
    var demoMode = false;
    
    // Channel ID
    var channelId = "";
    
    // Settings
    var sound = false;

    // Boss vars
    var nextBoss = "nifty255";
    ActionManager.pauseProcessing = true;

    // Timeout and Interval handlers
    var imgRemove = null;
    var frstDelay = null;
    var animDelay = null;
    var shakeStop = null;
    var hitShStop = null;

    // State indicators
    var isDelayed = false;
    var shaking = false;
    var lossShowing = false;
    var refill = false;
    var preload = true;
    
    // Name scroll
    var scrollInterval = 5000;
    var resetInterval = 1000;
    var scrollDelay = null;
    var resetDelay = null;

    // Hit label offset
    var lossOffset = 0;

    // Shake intensity
    var shakeIntensity = 1000;
    
    // HP settings
    var hpType = "overkill";
    var hpMult = 1;
    var hpAmnt = 1000;
    var bossHeal = false;
    
    // HP variables
    var prevHp = 0;
    var hp = 0;
    var delayed = 0;
    var loss = 0;
    var overkill = null;

    // Element containers
    var health = $("#health");
    var hitdelay = $("#hitdelay");
    var counter = $("#hp");
    var avatarimg = $("#avatar");    
    
    // Bits gifs
    
    // 1 bit
    var bits1 = [
        "http://i.imgur.com/axWaf1G.gif",
        "http://i.imgur.com/vrkWxrQ.gif",
        "http://i.imgur.com/T2RFqm3.gif",
        "http://i.imgur.com/bIUYT4E.gif"
    ];
    
    // 100 bits
    var bits100 = [
        "http://i.imgur.com/qIGLfo8.gif",
        "http://i.imgur.com/AxTcMpu.gif",
        "http://i.imgur.com/ueYVt9V.gif",
        "http://i.imgur.com/p8Wxr0m.gif"
    ];
    
    // 1000 bits
    var bits1000 = [
        "http://i.imgur.com/TQPP9xT.gif",
        "http://i.imgur.com/bvG9kkm.gif",
        "http://i.imgur.com/QRI0GE5.gif",
        "http://i.imgur.com/JpuqYpk.gif"
    ];
    
    // 5000 bits
    var bits5000 = [
        "http://i.imgur.com/A6EIUy1.gif",
        "http://i.imgur.com/ddgxLpl.gif",
        "http://i.imgur.com/DBjwiB3.gif",
        "http://i.imgur.com/Btlkt1D.gif"
    ];
    
    // 10000 bits
    var bits10000 = [
        "http://i.imgur.com/koNnePN.gif",
        "http://i.imgur.com/0HU0GFx.gif",
        "http://i.imgur.com/f8aQMPt.gif",
        "http://i.imgur.com/LCYgixP.gif"
    ];
    
    // Heal
    var heal = "http://i.imgur.com/fOvRfRk.gif";
    
    parseCookies();
    
    if (GetUrlParameter("token") != null)
    {
        oauth = GetUrlParameter("token");
        sound = (GetUrlParameter("sound") == "true");
        if (GetUrlParameter("trans") == "true") { $(".allcontainer").css("background-color", "rgba(0,0,0,0)"); }
        if (GetUrlParameter("chroma") == "true") { $(".allcontainer").css("background-color", "#00f"); }
        
        hpType = GetUrlParameter("hptype") || hpType;
        hpMult = parseInt(GetUrlParameter("hpmult")) || hpMult;
        hpAmnt = (hpType == "overkill" ? parseInt(GetUrlParameter("hpinit")) || hpAmnt : parseInt(GetUrlParameter("hpamnt")) || hpAmnt);
        
        bossHeal = (GetUrlParameter("bossheal") == "true");
        
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
        oauth = getCookie("auth", "");
        sound = (getCookie("sound", "") == "true");
        if (getCookie("trans", "") == "true") { $(".allcontainer").css("background-color", "rgba(0,0,0,0)"); }
        if (getCookie("chroma", "") == "true") { $(".allcontainer").css("background-color", "#00f"); }
        
        hpType = getCookie("hptype", "overkill");
        hpMult = parseInt(getCookie("hpmult", "1"));
        hpAmnt = (hpType == "overkill" ? parseInt(getCookie("hpinit", "") || hpAmnt) : parseInt(getCookie("hpamnt", "")) || hpAmnt);
        
        bossHeal = (getCookie("bossheal", "") == "true");
        
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
    
    if (oauth == "") { $("body").html("<h1 style='color: red;'>ERROR. NO AUTH.</h1>"); return; }
    
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
    
    nextBoss = getCookie("currentBoss", "");
    ActionManager.pauseProcessing = nextBoss != null
    prevHp = Math.min(parseInt(getCookie("currentHp", "0")), hpAmnt);

    $.ajax({
        url: "https://api.twitch.tv/helix/users",
        type: "GET",
        beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', "Bearer " + accessToken); xhr.setRequestHeader('Client-Id', clientId); },
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
                Listen(["channel-bits-events-v1." + channelId, "channel-points-channel-v1."+ channelId] , accessToken, [ProcessBitEventData, ProcessChannelPointsEventData]);
            });
        },
        error: function(data) {
            
            $("body").html("<h1 style='color: red;'>ERROR. FAILED STREAMER GET.</h1>");
        }
      });
    
    function ProcessBitEventData(message)
    {
        ActionManager.actions.push(new Action(InterpretBitEventData, message));
    }

    function ProcessChannelPointsEventData(message)
    {
        ActionManager.actions.push(new Action(InterpretChannelPointsEventData, message));
    }

    function InterpretBitEventData(message) {
        if (!message) { return; }
        if (!message.user_name) { return; }
        if (!message.bits_used) { return; }
        if (!message.context) { return; }
        if (nextBoss == "")
        {
            GetUserInfo(message.user_name, function(info) {
                
                $("#attackerdisplay").css({
                    
                    "opacity": "0"
                });
                
                var amount = "";
                
                if (message.bits_used < 100) { amount = "1"; }
                else if (message.bits_used < 1000) { amount = "100"; }
                else if (message.bits_used < 5000) { amount = "1000"; }
                else if (message.bits_used < 10000) { amount = "5000"; }
                else { amount = "10000"; }
                
                if (info.displayName == $("#name").html())
                {
                    if (bossHeal)
                    {
                        $("#attackerdisplay").html("<img id='cheerimg' src='https://d3aqoihi2n8ty8.cloudfront.net/actions/" + message.context + "/light/animated/" + amount + "/1.gif?a=" + Math.random() + "'>" + info.displayName + " heals!");

                        $("#attackerdisplay").stop().animate({ "opacity": "1" }, 1000, "linear", function() { setTimeout(function() { $("#attackerdisplay").css("opacity", "0"); $("#attackerdisplay").html("&nbsp;"); }, 1000) });

                        Heal(message.bits_used, message.user_name, info.displayName);
                    }
                }
                else
                {
                    $("#attackerdisplay").html("<img id='cheerimg' src='https://d3aqoihi2n8ty8.cloudfront.net/actions/" + message.context + "/light/animated/" + amount + "/1.gif?a=" + Math.random() + "'>" + info.displayName + " attacks!");

                    $("#attackerdisplay").stop().animate({ "opacity": "1" }, 1000, "linear", function() { setTimeout(function() { $("#attackerdisplay").css("opacity", "0"); $("#attackerdisplay").html("&nbsp;"); }, 1000) });

                    Strike(message.bits_used, message.user_name, info.displayName);
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

        if(nextBoss == "")
        {
            GetUserInfo(redemptionData.user.login, function(info) {
                
                $("#attackerdisplay").css({
                    
                    "opacity": "0"
                });
                
                var amount = "";
                pointCost = redemptionData.reward.cost / 10;

                if (pointCost < 100) { amount = "1"; }
                else if (pointCost < 1000) { amount = "100"; }
                else if (pointCost < 5000) { amount = "1000"; }
                else if (pointCost < 10000) { amount = "5000"; }
                else { amount = "10000"; }
                
                if (info.displayName == $("#name").html())
                {
                    if(bossHeal)
                    {
                        $("#attackerdisplay").html("<img id='cheerimg' src='https://d3aqoihi2n8ty8.cloudfront.net/actions/" + message.context + "/light/animated/" + amount + "/1.gif?a=" + Math.random() + "'>" + info.displayName + " heals!");

                        $("#attackerdisplay").stop().animate({ "opacity": "1" }, 1000, "linear", function() { setTimeout(function() { $("#attackerdisplay").css("opacity", "0"); $("#attackerdisplay").html("&nbsp;"); }, 1000) });

                        Heal(pointCost, redemptionData.user.login, info.displayName);
                    }
                }
                else
                {
                    $("#attackerdisplay").html("<img id='cheerimg' src='https://d3aqoihi2n8ty8.cloudfront.net/actions/" + message.context + "/light/animated/" + amount + "/1.gif?a=" + Math.random() + "'>" + info.displayName + " attacks!");

                    $("#attackerdisplay").stop().animate({ "opacity": "1" }, 1000, "linear", function() { setTimeout(function() { $("#attackerdisplay").css("opacity", "0"); $("#attackerdisplay").html("&nbsp;"); }, 1000) });

                    Strike(pointCost, redemptionData.user.login, info.displayName);
                }
            });
        }
    }
    
    function Heal(amount, healer, display) {
        
        if (nextBoss == "")
        {
            $("#strikeimg").remove();
            if (imgRemove != null) { clearTimeout(imgRemove); }
            
            loss -= amount;
            setCookie("currentHp", Math.min(hp - loss, hpAmnt).toString());

            isDelayed = true;

            if (animDelay != null) { clearTimeout(animDelay); }

            if (frstDelay != null) { clearTimeout(frstDelay); }

            frstDelay = setTimeout(RunHpCalc, 1000);
        }
    }

    function Strike(amount, attacker, display) {
        
        if (nextBoss == "")
        {
            var imgToUse = "";

            if (amount < 100)
            {
                imgToUse = bits1[GetRandomInt(0, bits1.length - 1)];
            }
            else if (amount < 1000)
            {
                imgToUse = bits100[GetRandomInt(0, bits100.length - 1)];
            }
            else if (amount < 5000)
            {
                imgToUse = bits1000[GetRandomInt(0, bits1000.length - 1)];
            }
            else if (amount < 10000)
            {
                imgToUse = bits5000[GetRandomInt(0, bits5000.length - 1)];
            }
            else
            {
                imgToUse = bits10000[GetRandomInt(0, bits10000.length - 1)];
            }
            
            if (sound) { hits[GetRandomInt(0, hits.length - 1)].play(); }

            $("#strikeimg").remove();
            if (imgRemove != null) { clearTimeout(imgRemove); }
            avatarimg.after('<img id="strikeimg" src="' + imgToUse + '?a=' + Math.random() + '"/>');
            imgRemove = setTimeout(function() { $("#strikeimg").remove(); }, 1000);

            loss += amount;
            if (hp - loss <= 0)
            {
                overkill = loss - hp;
                prevHp = 0;
                
                console.log("Overkill: " + overkill.toString());
                
                nextBoss = attacker;
                ActionManager.pauseProcessing = true;
                counter.html("Final Blow: " + display);
                
                setCookie("currentBoss", nextBoss);
                
                if (hpType == "overkill")
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
            health.css("width", ((hp / hpAmnt) * 100).toString() + "%");
            if (sound) { damage[GetRandomInt(0, damage.length - 1)].play(); }
            
            lossOffset = 20;
            lossShowing = true;
            $("#loss").html("-" + loss.toString());
            $("#loss").css({

                "-webkit-transform": "translateY(" + lossOffset.toString() + "px)",
                "-ms-transform": "translateY(" + lossOffset.toString() + "px)",
                "transform": "translateY(" + lossOffset.toString() + "px)",
                "visibility": "visible"
            });
            
            if (hitShStop != null) { clearTimeout(hitShStop); }
            if (shakeStop != null) { clearTimeout(shakeStop); }
            
            shaking = true;
            shakeIntensity = 1000;
            
            animDelay = setTimeout(function() {

                isDelayed = false;
            }, 1000);
            
            shakeStop = setTimeout(function() {

                shaking = false;
                avatarimg.css({

                    "-webkit-transform": "translate(0px,0px)",
                    "-ms-transform": "translate(0px,0px)",
                    "transform": "translate(0px,0px)"
                });
            }, 1000);
            
            loss = 0;
        }
        else if (loss < 0)
        {
            lossOffset = 20;
            lossShowing = true;
            $("#loss").html("+" + Math.abs(loss).toString());
            $("#loss").css({

                "-webkit-transform": "translateY(" + lossOffset.toString() + "px)",
                "-ms-transform": "translateY(" + lossOffset.toString() + "px)",
                "transform": "translateY(" + lossOffset.toString() + "px)",
                "visibility": "visible"
            });
            
            if (hp < delayed)
            {
                health.css("width", ((hp / hpAmnt) * 100).toString() + "%");
            }
            
            avatarimg.after('<img id="strikeimg" src="' + heal + '?a=' + Math.random() + '"/>');
            imgRemove = setTimeout(function() { $("#strikeimg").remove(); }, 1000);
            
            if (hitShStop != null) { clearTimeout(hitShStop); }
            if (shakeStop != null) { clearTimeout(shakeStop); }
            
            shaking = false;
            avatarimg.css({

                "-webkit-transform": "translate(0px,0px)",
                "-ms-transform": "translate(0px,0px)",
                "transform": "translate(0px,0px)"
            });
            
            animDelay = setTimeout(function() {

                isDelayed = false;
            }, 1000);
            
            loss = 0;
        }
    }

    function Explode() {

        preload = true;
        
        if (sound) { explosion.play(); }
        
        avatarimg.after('<img id="explodeimg" src="http://i.imgur.com/m9Ajapt.gif?a='+Math.random()+'"/>');
        avatarimg.animate({opacity: 0}, 1000, "linear", function() {

            $("#explodeimg").remove();
            GetNewBoss();
        });
    }

    function Shake() {

        shakeIntensity  = Math.max(0, shakeIntensity - 16);

        var x = Math.floor((Math.random() - 0.5) * 7) * (shakeIntensity / 1000);
        var y = Math.floor((Math.random() - 0.5) * 7) * (shakeIntensity / 1000);

        avatarimg.css({

            "-webkit-transform": "translate(" + x.toString() + "px," + y.toString() + "px)",
            "-ms-transform": "translate(" + x.toString() + "px," + y.toString() + "px)",
            "transform": "translate(" + x.toString() + "px," + y.toString() + "px)"
        });
    }

    function GetNewBoss() {
        
        if (nextBoss == "") { return; }
        
        GetUserInfo(nextBoss, function(info) {
            
            if (info.logo == null) { avatarimg.attr("src", "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png"); }
            else { avatarimg.attr("src", info.logo); }
            avatarimg.on('load', function() {
                
                if (hpType == "overkill" && overkill != null)
                {
                    hpAmnt = (overkill * hpMult < 100 ? 100 : overkill * hpMult);
                }
                
                $("#name").html(info.displayName);
                $("#test").html(info.displayName);
                
                $("#name").stop().css("margin-left", "0px");
                
                if (scrollDelay != null && scrollDelay != -1) { clearTimeout(scrollDelay); scrollDelay = null; }
                if (resetDelay != null) { clearTimeout(resetDelay); resetDelay = null; }
                
                refill = true;
                preload = false;

                hitdelay.css({
                    "visibility": "hidden"
                });
                
                avatarimg.css("opacity", "0");
                avatarimg.animate({ opacity: 1 }, 1000, "linear");
                avatarimg.off('load');
            });
        });
    }
    
    function GetUserInfo(username, callback) {
        
        if (username == "") { return; }
        if (!callback) { return; }

        $.ajax({
            url: "https://api.twitch.tv/helix/users?login=" + username,
            type: "GET",
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', "Bearer " + accessToken); xhr.setRequestHeader('Client-Id', clientId); },
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

    function GetRandomInt(min, max) {

        return Math.floor(Math.random() * (max - min + 1)) + min;
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

        if (refill)
        {
            if (prevHp == 0) { hp = Math.min(hpAmnt, hp + (hpAmnt / 60)); }
            else { hp = Math.min(prevHp, hp + (prevHp / 60)); }
            delayed = hp;
            counter.html("HP: " + Math.floor(delayed).toLocaleString("en-US") + " / " + hpAmnt.toLocaleString("en-US"));
            health.css("width", ((hp / hpAmnt) * 100).toString() + "%");

            if (hp == (prevHp == 0 ? hpAmnt : prevHp))
            {
                refill = false;
                nextBoss = "";
                ActionManager.pauseProcessing = false;
                hitDelayWidth = ((delayed / hpAmnt) * 100).toString() + "%";
                hitdelay.css({
                    "width": hitDelayWidth,
                    "visibility": "visible"
                });
            }
        }

        if (!isDelayed && !refill && !preload)
        {
            if (delayed > hp)
            {
                delayed = Math.max(delayed - ((hpAmnt / 5) / 60), hp);
                if (nextBoss == "") { counter.html("HP: " + Math.floor(delayed).toLocaleString("en-US") + " / " + hpAmnt.toLocaleString("en-US")); }
                hitdelay.css("width", ((delayed / hpAmnt) * 100).toString() + "%");

                if (delayed == 0)
                {
                    Explode();
                }
            }
            else if (delayed < hp)
            {
                delayed = Math.min(delayed + ((hpAmnt / 5) / 60), hp);
                counter.html("HP: " + Math.floor(delayed).toLocaleString("en-US") + " / " + hpAmnt.toLocaleString("en-US"));
                health.css("width", ((delayed / hpAmnt) * 100).toString() + "%");
                hitdelay.css("width", ((delayed / hpAmnt) * 100).toString() + "%");
            }
        }

        if (shaking)
        {
            Shake();
        }

        if (lossOffset > 0)
        {
            lossOffset = Math.max(0, lossOffset - (20 / 50));

            $("#loss").css({

                "-webkit-transform": "translateY(" + lossOffset.toString() + "px)",
                "-ms-transform": "translateY(" + lossOffset.toString() + "px)",
                "transform": "translateY(" + lossOffset.toString() + "px)"
            });
        }
        else if (lossShowing)
        {
            lossShowing = false;
            hitShStop = setTimeout(function() {

                $("#loss").css("visibility", "hidden");
            }, 500);
        }
        

        /////////////////////////////////////////////////////////////////////////////
        // Handle scrolling of the display name.
        /////////////////////////////////////////////////////////////////////////////
        var nameWidth = $("#test").width();
        var scrollWidth = $("#scroll").width();
        
        if (nameWidth > scrollWidth)
        {
            if (scrollDelay == null)
            {
                scrollDelay = setTimeout(function() {
                    
                    scrollDelay = -1;
                    
                    $("#name").stop().animate({"marginLeft": "-" + (nameWidth - scrollWidth).toString() + "px"}, 1000, "linear", function() {
                        
                        resetDelay = setTimeout(function() {
                            
                            $("#name").css("margin-left", "0px");
                            scrollDelay = null;
                        }, resetInterval);
                    });
                }, scrollInterval);
            }
        }
    }, (1000/60));
});