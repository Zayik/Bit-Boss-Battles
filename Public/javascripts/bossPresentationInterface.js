class BossPresentationInterface {
    constructor() {
      setInterval(function() 
      {
        
      });
    }

    HealPresentation(displayname, bit_points, context)
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

      $("#attackerdisplay").html("<img id='cheerimg' src='https://d3aqoihi2n8ty8.cloudfront.net/actions/" + context + "/light/animated/" + amount + "/1.gif?a=" + Math.random() + "'>" + displayname + " heals!");

      $("#attackerdisplay").stop().animate({ "opacity": "1" }, 1000, "linear", function() { setTimeout(function() { $("#attackerdisplay").css("opacity", "0"); $("#attackerdisplay").html("&nbsp;"); }, 1000) });

      $("#strikeimg").remove();
      
    }

    ShowLoss()
    {

    }
}