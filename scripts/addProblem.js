$(document).ready(function(){
    if($(".popup").length){
        $("body").append("<div id='disabled'></div>");
    }

    $("#OK").on("click",function(){
        event.preventDefault();
        $(".popup").fadeOut();
        $("#disabled").fadeOut();
    });
});