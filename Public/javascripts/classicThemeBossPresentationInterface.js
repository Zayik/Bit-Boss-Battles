class BossPresentationInterface {
    constructor(sound) {
      // Hit label offset
      this.lossOffset = 0;
      this.lossShowing = false;
      this.hitShStop = null;
      this.shakeStop = null;
      // Shake intensity
      this.shakeIntensity = 1000;
      // Name scroll
      this.scrollInterval = 5000;
      this.resetInterval = 1000;
      this.scrollDelay = null;
      this.resetDelay = null;
      this.hitdelay = $("#hitdelay");

      this.avatarimg = $("#avatar");
      this.health = $("#health");
      this.counter = $("#hp");
      this.imgRemove = null;
      // Heal
      this.heal = "http://i.imgur.com/fOvRfRk.gif";

      // Cookie setting.
      this.sound = sound;

      // Bits
      // 1 bit
      this.bits1 = [
          "http://i.imgur.com/axWaf1G.gif",
          "http://i.imgur.com/vrkWxrQ.gif",
          "http://i.imgur.com/T2RFqm3.gif",
          "http://i.imgur.com/bIUYT4E.gif"
      ];
      
      // 100 bits
      this.bits100 = [
          "http://i.imgur.com/qIGLfo8.gif",
          "http://i.imgur.com/AxTcMpu.gif",
          "http://i.imgur.com/ueYVt9V.gif",
          "http://i.imgur.com/p8Wxr0m.gif"
      ];
      
      // 1000 bits
      this.bits1000 = [
          "http://i.imgur.com/TQPP9xT.gif",
          "http://i.imgur.com/bvG9kkm.gif",
          "http://i.imgur.com/QRI0GE5.gif",
          "http://i.imgur.com/JpuqYpk.gif"
      ];
      
      // 5000 bits
      this.bits5000 = [
          "http://i.imgur.com/A6EIUy1.gif",
          "http://i.imgur.com/ddgxLpl.gif",
          "http://i.imgur.com/DBjwiB3.gif",
          "http://i.imgur.com/Btlkt1D.gif"
      ];
      
      // 10000 bits
      this.bits10000 = [
          "http://i.imgur.com/koNnePN.gif",
          "http://i.imgur.com/0HU0GFx.gif",
          "http://i.imgur.com/f8aQMPt.gif",
          "http://i.imgur.com/LCYgixP.gif"
      ];


      var _this = this;

      setInterval(function() {

        if(_this.lossOffset > 0)
        {
          _this.lossOffset = Math.max(0, _this.lossOffset - (20 / 50));

            $("#loss").css({

                "-webkit-transform": "translateY(" + _this.lossOffset.toString() + "px)",
                "-ms-transform": "translateY(" + _this.lossOffset.toString() + "px)",
                "transform": "translateY(" + _this.lossOffset.toString() + "px)"
            });
        }
        else if (_this.lossShowing)
        {
          _this.lossShowing = false;
          _this.hitShStop = setTimeout(function() {

                $("#loss").css("visibility", "hidden");
            }, 500);
        }
        

        if(_this.shaking)
        {
            _this.Shake();
        }

        // /////////////////////////////////////////////////////////////////////////////
        // // Handle scrolling of the display name.
        // /////////////////////////////////////////////////////////////////////////////
        var nameWidth = $("#test").width();
        var scrollWidth = $("#scroll").width();
        
        if (nameWidth > scrollWidth)
        {
            if (_this.scrollDelay == null)
            {
              _this.scrollDelay = setTimeout(function() {
                    
                _this.scrollDelay = -1;
                    
                    $("#name").stop().animate({"marginLeft": "-" + (nameWidth - scrollWidth).toString() + "px"}, 1000, "linear", function() {
                        
                      _this.resetDelay = setTimeout(function() {
                            
                            $("#name").css("margin-left", "0px");
                            _this.scrollDelay = null;
                        }, _this.resetInterval);
                    });
                }, _this.scrollInterval);
            }
        }
      }, (1000/60));
    }

    HealPresentation(displayname, bit_points, context, criticalStrikeDamage)
    {
      var amount = "";
      if (bit_points < 100) { amount = "1"; }
      else if (bit_points < 1000) { amount = "100"; }
      else if (bit_points < 5000) { amount = "1000"; }
      else if (bit_points < 10000) { amount = "5000"; }
      else { amount = "10000"; }


      $("#attackerdisplay").css({             
          "opacity": "0"
      });

      var healMsg = " heals!"
      if(criticalStrikeDamage > 0)
      {
        healMsg = " crits!"
      }

      $("#attackerdisplay").html("<img id='cheerimg' src='https://d3aqoihi2n8ty8.cloudfront.net/actions/" + context + "/light/animated/" + amount + "/1.gif?a=" + Math.random() + "'>" + displayname + healMsg);

      $("#attackerdisplay").stop().animate({ "opacity": "1" }, 1000, "linear", function() { setTimeout(function() { $("#attackerdisplay").css("opacity", "0"); $("#attackerdisplay").html("&nbsp;"); }, 1000) });

      $("#strikeimg").remove();
      
      if (this.imgRemove != null) { clearTimeout(this.imgRemove); }

    }

    StrikePresentation(bit_points, attacker, context, criticalStrikeDamage)
    {
      var imgToUse = "";
      var amount = "";
      if (bit_points < 100)
      {
          amount = 1;
          imgToUse = this.bits1[this.GetRandomInt(0, this.bits1.length - 1)];
      }
      else if (bit_points < 1000)
      {
          amount = 100;
          imgToUse = this.bits100[this.GetRandomInt(0, this.bits100.length - 1)];
      }
      else if (bit_points < 5000)
      {
          amount = 1000;
          imgToUse = this.bits1000[this.GetRandomInt(0, this.bits1000.length - 1)];
      }
      else if (bit_points < 10000)
      {
          amount = 5000;
          imgToUse = this.bits5000[this.GetRandomInt(0, this.bits5000.length - 1)];
      }
      else
      {
          amount = 10000;
          imgToUse = this.bits10000[this.GetRandomInt(0, this.bits10000.length - 1)];
      }
      
      if (this.sound) { hits[this.GetRandomInt(0, hits.length - 1)].play(); }

      $("#attackerdisplay").css({
              
          "opacity": "0"
      });

      var atkMsg = " attacks!"
      if(criticalStrikeDamage > 0)
      {
        atkMsg = " crits!"
      }

      $("#attackerdisplay").html("<img id='cheerimg' src='https://d3aqoihi2n8ty8.cloudfront.net/actions/" + context + "/light/animated/" + amount + "/1.gif?a=" + Math.random() + "'>" + attacker + atkMsg);

      $("#attackerdisplay").stop().animate({ "opacity": "1" }, 1000, "linear", function() { setTimeout(function() { $("#attackerdisplay").css("opacity", "0"); $("#attackerdisplay").html("&nbsp;"); }, 1000) });

      $("#strikeimg").remove();
      if (this.imgRemove != null) { clearTimeout(this.imgRemove); }
      this.avatarimg.after('<img id="strikeimg" src="' + imgToUse + '?a=' + Math.random() + '"/>');
      this.imgRemove = setTimeout(function() { $("#strikeimg").remove(); }, 1000);
    }

    ShowLoss(loss)
    {
      this.lossOffset = 20;
      this.lossShowing = true;
      if(loss < 0)
      {
        $("#loss").html("+" + Math.abs(loss).toString());
      }
      else
      {
        $("#loss").html("-" + loss.toString());
      }
      
      $("#loss").css({

          "-webkit-transform": "translateY(" + this.lossOffset.toString() + "px)",
          "-ms-transform": "translateY(" + this.lossOffset.toString() + "px)",
          "transform": "translateY(" + this.lossOffset.toString() + "px)",
          "visibility": "visible"
      });
    }

    UpdateCounterHealth(currentHealth, maxHealth)
    {
      this.counter.html("HP: " + Math.floor(currentHealth).toLocaleString("en-US") + " / " + maxHealth.toLocaleString("en-US"));
    }

    UpdateCounterFinalDisplay(display)
    {
      this.counter.html("Final Blow: " + display);
    }

    UpdateCounterHealth(currentHealth, maxHealth)
    {
      this.counter.html("HP: " + Math.floor(currentHealth).toLocaleString("en-US") + " / " + maxHealth.toLocaleString("en-US"));
    }

    UpdateHealth(currentHealth, maxHealth)
    {
      this.health.css("width", ((currentHealth / maxHealth) * 100).toString() + "%");
    }

    ///
    // 0 - No update to visibility status
    // 1 - Set visible
    // 2 - Set invisible
    UpdateHitDelay(currentHealth, maxHealth, visibilityLevel)
    {
      var hitDelayWidth = ((currentHealth / maxHealth) * 100).toString() + "%";
      if(visibilityLevel == 0)
      {
        this.hitdelay.css({
          "width": hitDelayWidth,
        });
      }
      else if(visibilityLevel == 1)
      {
        this.hitdelay.css({
          "width": hitDelayWidth,
          "visibility": "visible"
        });
      }
    }

    RunHPPresentationForLoss(loss, hp, hpAmnt)
    {
      this.UpdateHealth(hp, hpAmnt);
      this.ShowLoss(loss);
      if(this.hitShStop != null) { clearTimeout(this.hitShStop); }
      if(this.shakeStop != null) { clearTimeout(this.shakeStop); }
            
      this.shaking = true;
      this.shakeIntensity = 1000;

      var _this = this;
      this.shakeStop = setTimeout(function() {

        _this.shaking = false;
        _this.avatarimg.css({

            "-webkit-transform": "translate(0px,0px)",
            "-ms-transform": "translate(0px,0px)",
            "transform": "translate(0px,0px)"
        });
      }, 1000);

      if (this.sound) { damage[this.GetRandomInt(0, damage.length - 1)].play(); }
    }

    RunHPPresentationForGain(loss, hp, hpAmnt, delayed)
    {
        this.ShowLoss(loss);

        if (hp < delayed)
        {
            this.UpdateHealth(delayed, hpAmnt);
        }

        this.avatarimg.after('<img id="strikeimg" src="' + this.heal + '?a=' + Math.random() + '"/>');
        this.imgRemove = setTimeout(function() { $("#strikeimg").remove(); }, 1000);

        if (this.hitShStop != null) { clearTimeout(this.hitShStop); }
        if (this.shakeStop != null) { clearTimeout(this.shakeStop); }
        this.shaking = false;

        this.avatarimg.css({
          "-webkit-transform": "translate(0px,0px)",
          "-ms-transform": "translate(0px,0px)",
          "transform": "translate(0px,0px)"
      });
    }

    Shake() 
    {
      this.shakeIntensity  = Math.max(0, this.shakeIntensity - 16);

      var x = Math.floor((Math.random() - 0.5) * 7) * (this.shakeIntensity / 1000);
      var y = Math.floor((Math.random() - 0.5) * 7) * (this.shakeIntensity / 1000);

      this.avatarimg.css({

          "-webkit-transform": "translate(" + x.toString() + "px," + y.toString() + "px)",
          "-ms-transform": "translate(" + x.toString() + "px," + y.toString() + "px)",
          "transform": "translate(" + x.toString() + "px," + y.toString() + "px)"
      });
    }

    GetNewBoss(nextBoss, info, callback)
    {
      var _this = this;

      if (info.logo == null) { this.avatarimg.attr("src", "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png"); }
      else { this.avatarimg.attr("src", info.logo); }
      this.avatarimg.on('load', function() {
          
          $("#name").html(info.displayName);
          $("#test").html(info.displayName);               
          $("#name").stop().css("margin-left", "0px");
          
          if (_this.scrollDelay != null && _this.scrollDelay != -1) { clearTimeout(_this.scrollDelay); _this.scrollDelay = null; }
          if (_this.resetDelay != null) { clearTimeout(_this.resetDelay); _this.resetDelay = null; }
         
          _this.hitdelay.css({
              "visibility": "hidden"
          });
          
          _this.avatarimg.css("opacity", "0");
          _this.avatarimg.animate({ opacity: 1 }, 1000, "linear");
          _this.avatarimg.off('load');
          callback();
      });
    }
    
    StartWoundedAnimation()
    {
      // Start wounded animation
      $("#healthcontainer").css(
      {            
        "position": "relative",
        "height": "32px",
        "bottom" : "0px",
        "animation" : "shadow-pulse 2s infinite"
      });
    }

    EndWoundedAnimation()
    {
      // End wounded animation
      $("#healthcontainer").css({
        "position": "relative",
        "height": "32px",
        "bottom" : "0px",
        "animation" : "none"
      });
    }

    GetRandomInt(min, max) 
    {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    KillBossPresentation(callback)
    {
        if (this.sound) { explosion.play(); }
        this.avatarimg.after('<img id="explodeimg" src="http://i.imgur.com/m9Ajapt.gif?a='+Math.random()+'"/>');
        this.avatarimg.animate({opacity: 0}, 1000, "linear", function() 
        {
            $("#explodeimg").remove();
            callback();
        });
    }
}