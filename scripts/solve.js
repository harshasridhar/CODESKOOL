$(document).ready(function(){
    var c = "#include<stdio.h>\nvoid main(){\n\t//Enter your code here\n\n}";
    var cpp = "#include<iostream>\nusing namespace std;\nint main(){\n\t//Enter your code here\n\n}";
    var java = "import java.io.*;\npublic class Main{\n\tpublic static void main(String[] args){\n\t//Enter your code here\n\n\t}\n}";
    var python3 = "#Enter your code here\n";

    var code = $(".codemirror-textarea")[0];
    var editor = CodeMirror.fromTextArea(code,{lineNumbers : true,matchBrackets: true,mode : "text/x-csrc"});

    $("select").change(function(){
        var lang = $(this).children("option:selected").val();
        var r = confirm("Language will be changed and all the previous changes will be lost");

        if(r == true){
            if(lang == "C"){
                editor.setOption("mode","text/x-csrc");
                editor.getDoc().setValue(c);
            }
            else if(lang == "C++"){
                editor.setOption("mode","text/x-csrc");
                editor.getDoc().setValue(cpp);
            }
            else if(lang == "Java"){
                editor.setOption("mode","text/x-csrc");
                editor.getDoc().setValue(java);
            }
            else if(lang == "Python3"){
                editor.setOption("mode","text/x-python");
                editor.getDoc().setValue(python3);
            }
        }
    });
});