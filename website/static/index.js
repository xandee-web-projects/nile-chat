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
function calc_flames(e){
	var flames = [
		"Friends",
		"Lovers",
		"Admirers",
		"Married",
		"Enemies",
		"Secret admirers",
	];
	var name1 = $("#name1").val().replace(" ", "").toLowerCase();
	var name2 = $("#name2").val().replace(" ", "").toLowerCase();
	const n1 = name1
	const n2 = name2
	if (name1 == "" || name2 == "") return;
	name1.split("").forEach((element) => {
		if (name2.includes(element)) {
			name1 = name1.replace(element, "");
			name2 = name2.replace(element, "");
		}
	});
	count = (name1+name2).length-1;
	const res = count > 0 ? flames[count%6] : "You wont confuse me ijn";
	$("#flamesResult").html(res);
	$("#shareFlames").css('display', "block");
	return [n1, n2, res]
}
$("#calculate_flames").click(calc_flames);

$("#shareFlames").click(e=>{
	var result = calc_flames();
	socket.emit("flames", {n1: result[0], n2: result[1], res: result[2]});
	$("#close").trigger('click')
});
$("#imageupload").bind("change", async function (event) {
	$("#progress-ui").css("display", "block");
	const imageFile = event.target.files[0];
	const options = {
		maxSizeMB: 3,
		maxWidthOrHeight: 600,
		useWebWorker: true,
	};
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
		socket.emit("image", msg);
	};
	reader.readAsDataURL(data);

	reader.onprogress = function (currentFile) {
		if (currentFile.lengthComputable) {
			var progress = parseInt(
				(currentFile.loaded / currentFile.total) * 100,
				10
			);
			$("#progress").html(progress);
			$("#progress-bar").css("width", progress.toString() + "%");
			if (progress >= 99) $("#progress-ui").css("display", "none");
		}
	};
	reader.onerror = function () {
		alert("Could not read the file: large file size");
	};
}
