$(document).ready(function() {
    
    parseCookies();
    
    if (getCookie("sound", "") == "true") { $("#sound").prop("checked", true); }
    if (getCookie("trans", "") == "true") { $("#trans").prop("checked", true); }
    if (getCookie("chroma", "") == "true") { $("#chroma").prop("checked", true); }
    if (getCookie("persistent", "") == "true") { $("#persistent").prop("checked", true); }
    if (getCookie("bossheal", "") == "true") { $("#bossheal").prop("checked", true); }
    
    if (getCookie("hptype", "overkill") == "constant")
    {
        $("input[type='radio'][name='hp'][value='constant']").click();
        
        $("#hp-amnt").prop("disabled", false);
        $("#hp-init").prop("disabled", true);
        $("#hp-mult").prop("disabled", true);
    }
    
    if (getCookie("hpmult", "") != "") { $("#hp-mult").val(parseInt(getCookie("hpmult", "")) || 1) }
    if (getCookie("hpinit", "") != "") { $("#hp-init").val(parseInt(getCookie("hpinit", "")) || 1000) }
    if (getCookie("hpamnt", "") != "") { $("#hp-amnt").val(parseInt(getCookie("hpamnt", "")) || 1000) }

    // Get cookies for Wounded mode.
    if (getCookie("bosswounded", "") == "true") { $("#boss-wounded").prop("checked", true); }
    if (getCookie("bosswoundedmultiplier", "") != "") { $("#boss-wounded-mult").val(parseFloat(getCookie("bosswoundedmultiplier", "")) || 1) }
    if (getCookie("bosswoundedduration", "") != "") { $("#boss-wounded-duration").val(parseFloat(getCookie("bosswoundedduration", "")) || 1) }
    if($("#boss-wounded").prop("checked"))
    {
        $("#boss-wounded-mult").prop("disabled", false);
        $("#boss-wounded-duration").prop("disabled", false);
    }

    $("#sound").click(function() {
        
        setCookie("sound", $(this).prop("checked").toString());
    });
    
    $("#trans").click(function() {
        
        setCookie("trans", $(this).prop("checked").toString());
    });
    
    $("#chroma").click(function() {
        
        setCookie("chroma", $(this).prop("checked").toString());
    });
    
    $("#persistent").click(function() {
        
        setCookie("persistent", $(this).prop("checked").toString());
    });
    
    $("#bossheal").click(function() {
        
        setCookie("bossheal", $(this).prop("checked").toString());
    });
    
    $("input[type='radio'][name='hp']").change(function() {
        
        setCookie("hptype", $(this).val());
        if ($(this).val() == "overkill")
        {
            $("#hp-mult").prop("disabled", false);
            $("#hp-init").prop("disabled", false);
            $("#hp-amnt").prop("disabled", true);
        }
        else if ($(this).val() == "constant")
        {
            $("#hp-amnt").prop("disabled", false);
            $("#hp-init").prop("disabled", true);
            $("#hp-mult").prop("disabled", true);
        }
    });
    
    $("#hp-mult").change(function() {
        
        setCookie("hpmult", $(this).val().toString());
    });
    
    $("#hp-init").change(function() {
        
        setCookie("hpinit", $(this).val().toString());
    });
    
    $("#hp-amnt").change(function() {
        
        setCookie("hpamnt", $(this).val().toString());
    });

    $("#boss-wounded-mult").change(function() {
        
        setCookie("bosswoundedmultiplier", $(this).val().toString());
    });

    $("#boss-wounded-duration").change(function() {
        
        setCookie("bosswoundedduration", $(this).val().toString());
    });

    $("#boss-wounded").change(function() {
        if($(this).prop("checked"))
        {
            $("#boss-wounded-mult").prop("disabled", false);
            $("#boss-wounded-duration").prop("disabled", false);
        }
        else
        {
            $("#boss-wounded-mult").prop("disabled", true);
            $("#boss-wounded-duration").prop("disabled", true);
        }
        setCookie("bosswounded", $(this).prop("checked").toString());
    });
});