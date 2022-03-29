function send_message() {
	text = $("#message_holder").val();
	if (text.replace(" ", "") != "") {
		$("#message_holder").val("");
		$("#message_holder").focus();
		socket.emit("send", { message: text });
	}
}
$("#send_message").click(function (e) {
	send_message();
});
$("#logout").click(function (e) {
	var yes = confirm("You will be logged out");
	if (yes) {
		fetch("/logout", { method: "GET" }).then((_res) => {
			window.location.href = "/login";
		});
	}
});
$("#send_pic").click(function (e) {
	e.preventDefault();
	$('<input type="file" />').click();
	// $("#send_pic").prop('disabled', true);
	// $("#message_holder").val("")
});

$("#message_holder").keydown(function (event) {
	if (event.which == 13) {
		send_message();}
});




