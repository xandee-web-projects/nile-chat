Notification.requestPermission();

function convertArray(array) {
	return JSON.stringify(array).replace(/\[/g, '{').replace(/\]/g, '}');
}
function drawImageToCanvas(image) {
const canvas = document.createElement('canvas');
canvas.width = image.width;
canvas.height = image.height;
  canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
  return canvas;
}
function convertImage(image) {
	const canvas = drawImageToCanvas(image);
	const ctx = canvas.getContext('2d');
  
	let result = [];
	for (let y = 0; y < canvas.height; y++) {
		result.push([]);
    for (let x = 0; x < canvas.width; x++) {
		let data = ctx.getImageData(x, y, 1, 1).data;
		result[y].push(data[0]);
		result[y].push(data[1]);
		result[y].push(data[2]);
    }
}
  
const arrayCode = `
#define IMAGE_WIDTH ${canvas.width}
#define IMAGE_HEIGHT ${canvas.height}
#define BYTES_PER_PIXEL 3
uint8_t imageData[IMAGE_HEIGHT][IMAGE_WIDTH * BYTES_PER_PIXEL] = ${convertArray(result)};
`;
console.log(arrayCode);
}

function onImageChange(event) {
	console.log("trigg");
	const imageFile = URL.createObjectURL(event.target.files[0]);
	convertImage(imageFile)
}
$('<input type="file" />').change(e => console.log("rgfdvs"))



function send_message(is_picture=false) {
	text = $("#message_holder").val();
	if (is_picture) $("#send_pic").prop('disabled', true);
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




