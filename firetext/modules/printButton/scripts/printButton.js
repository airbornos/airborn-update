window.addEventListener("DOMContentLoaded",function(){var a=new MessageProxy;a.setSend(parent);a.setRecv(window);a.registerMessageHandler(function(b){document.open("text/html","replace");document.write(b.data.content);document.close();a.setRecv(window);window.print()},"print")});
