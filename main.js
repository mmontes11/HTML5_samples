var db;

try {
	if (window.openDatabase) {
	    db = openDatabase("TodoDB", "1.0", "HTML5 Database API example", 200000);
	    if (!db)
	        console.log("Failed to open the database on disk.  This is probably because the version was bad or there is not enough space left in this domain's quota");
		else
			console.log("Database opened succesfuly");
	} else
		console.log("Couldn't open the database.  Please try with a WebKit nightly with this feature enabled");
} catch(err) {}


var init = function(){
	db.transaction(function(tx) {
		tx.executeSql("SELECT COUNT(*) FROM Todo", [], function(result) {

	    }, function(tx, error) {
	        tx.executeSql("CREATE TABLE Todo (text TEXT)", [], function(result) { 
	        	console.log("Database created succesfuly");
	        });
	    });
	});	
}

var loadTodos = function(){
	console.log("Loading Todos...");
	$("#todos").empty();
	db.transaction(function(tx) {
		tx.executeSql("SELECT id, text FROM Todo", [], function(tx, result) {
            for (var i = 0; i < result.rows.length; ++i) {
                var row = result.rows.item(i);
                var text = row['text'];
                $("#todos").append("<li>"+text+"</li>");
            }

            if (!result.rows.length){
            	console.log("No Todos found.");
            }	
            	
        }, function(tx, error) {
            alert('Failed to retrieve Todos from database - ' + error.message);
            return;
        });
	});	
}

var deleteTodos = function(){
	db.transaction(function(tx)
	{
	    tx.executeSql("DELETE FROM Todo");
	});
	loadTodos();
}

var addTodo = function(){
	console.log("Adding a Todo");
	var todoText = $("#todoText").val();
	db.transaction(function (tx) 
	{
	    tx.executeSql("INSERT INTO Todo (text) VALUES (?)", [todoText], function(tx,result){

	    }, function(tx,error){

	    });
	});	
	loadTodos();
};

init();
loadTodos();