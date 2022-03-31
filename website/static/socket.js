var socket;

function random_color(text) {
	const randomColor = CryptoJS.MD5(text).toString().slice(0, 8);
	return "#" + randomColor;
}
function msg_text(msg, is_sender, name) {
	const sent = is_sender ? "right" : "left";
	const c = is_sender ? "r" : "l";
	const style = is_sender ? " style='text-align: right;'" : "";
	return `<div class="chat-message-${sent} pb-4">
                <div>
                    <polkadot-web-identicon style="display: inline-block;" address="${
											msg.i
										}" theme="jdenticon" class="rounded-circle mr-1" size="40"></polkadot-web-identicon>
                    <div class="text-muted small text-nowrap mt-2" style='text-align: center;'>${
											msg.t
										}</div>
                </div>
                <div class="flex-shrink-1 bg-dark rounded py-2 px-3 m${c}-3">
                <div ${style}><button class="usernames font-weight-bold mb-1" style="color: ${random_color(
		name
	)}">${name}</button></div>
                    ${msg.msg}
                </div>
            </div>`;
}
function img_msg(msg, is_sender, name) {
	const sent = is_sender ? "right" : "left";
	const c = is_sender ? "r" : "l";
	const style = is_sender ? " style='text-align: right;'" : "";
	return `<div class="chat-message-${sent} pb-4">
                <div>
                    <polkadot-web-identicon style="display: inline-block;" address="${
											msg.i
										}" theme="jdenticon" class="rounded-circle mr-1" size="40"></polkadot-web-identicon>
                    <div class="text-muted small text-nowrap mt-2" style='text-align: center;'>${
											msg.t
										}</div>
                </div>
                <div class="flex-shrink-1 bg-dark rounded py-2 px-3 m${c}-3">
                <div ${style}><button class="usernames font-weight-bold mb-1" style="color: ${random_color(
		name
	)}">${name}</button></div>
                    <img src="${msg.img}" class="responsive rounded">
                </div>
            </div>`;
}
function connect_btns() {
	const wrapper = document.getElementById("chat");
	wrapper.addEventListener("click", (event) => {
		const isButton = event.target.nodeName === "BUTTON";
		if (!isButton) {
			return;
		}
		$("#message_holder").val(
			$("#message_holder").val() + "@" + event.target.innerHTML + " "
		);
	});
}
$(document).ready(function () {
	connect_btns();
	socket = io("http://" + document.domain + ":" + location.port + "/chat");
	socket.on("connect", function () {
		socket.emit("online");
	});
	socket.on("general_message", function (msg) {
		$("#chat").append(
			`<div class="chat-message pb-4">
				<div class="flex-shrink-1 bg-dark rounded py-2 px-3">
					<div>-Anonymous chat</div>
				${msg.msg}
			</div>
		</div>`
		);
	});
	socket.on("get_messages", function (msgs) {
		msgs.forEach(function (msg) {
			const is_sender = msg.is_s;
			const name = msg.is_s ? "You" : msg.s;
			if (msg.img == null) {
				$("#chat").prepend(msg_text(msg, is_sender, name));
			} else {
				$("#chat").prepend(img_msg(msg, is_sender, name));
			}
		});
		$("#chat").children().slice(-1)[0].scrollIntoView();
		$("#message_holder").focus();
	});
	socket.on("new_message", function (msg) {
		const is_sender = msg.s_id == current_user;
		const name = is_sender ? "You" : msg.s;
		$("#chat").append(msg_text(msg, is_sender, name));
		$("#chat").children().slice(-1)[0].scrollIntoView();
	});

	socket.on("new_image", (msg) => {
		const is_sender = msg.s_id == current_user;
		const name = is_sender ? "You" : msg.s;
		$("#chat").append(img_msg(msg, is_sender, name));
		$("#chat").children().slice(-1)[0].scrollIntoView();
	});
});
