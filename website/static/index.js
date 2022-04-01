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

$("#message_holder").keydown(function (event) {
	if (event.which == 13) {
		send_message();
	}
});

$('#imageupload').bind('change', async function (event) {
	$("#progress-ui").css("display", "block");
	const imageFile = event.target.files[0];
	const options = {
		maxSizeMB: 3,
		maxWidthOrHeight: 600,
	  useWebWorker: true
	}
	try {
		const compressedFile = await imageCompression(imageFile, options);
	  await readThenSendFile(compressedFile); //readin the compressed file
	} catch (error) {
	  await readThenSendFile(imageFile); // if filetype is not image then sent orignal data without compression
	}	
	
});

function readThenSendFile(data) {
  var reader = new FileReader();
  reader.onload = function (evt) {
	var msg = evt.target.result;
	socket.emit('image', msg);
  };
  reader.readAsDataURL(data);

  reader.onprogress = function (currentFile) {
	if (currentFile.lengthComputable) {
	  var progress = parseInt(((currentFile.loaded / currentFile.total) * 100), 10);
	  $("#progress").html(progress);
	  $("#progress-bar").css("width", progress.toString()+"%");
		if (progress >= 99) $("#progress-ui").css("display", "none");
	}
  }
  reader.onerror = function () {
	alert("Could not read the file: large file size");
  };
}