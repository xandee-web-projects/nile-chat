var socket;

function isTooDark(color) {
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness > 20;
}

function random_color(text) {
	var randomColor = CryptoJS.MD5(text).toString().slice(0, 8);
	var i = 0;
	while(isTooDark(randomColor) && i < 32){
		randomColor = CryptoJS.MD5(text).toString().slice(i, i+8);
		i++;
	}
	return "#" + randomColor;
}
function msg_text(msg, is_sender, name) {
	const sent = is_sender ? "right" : "left";
	const c = is_sender ? "r" : "l";
	const opp_sent = is_sender ? "left" : "right";
	const style = is_sender ? " style='text-align: right;'" : "";
	const btn = `<button class="usernames text-nowrap font-weight-bold mb-1" style="color: ${random_color(name)};">${name}</button>`
	const identicon = `<polkadot-web-identicon style="display: inline-block;" address="${msg.i}" theme="jdenticon" class="rounded-circle mr-1" size="25"></polkadot-web-identicon>`
	var order = is_sender ? btn+identicon : identicon+btn
	return `<div class="chat-message-${sent} pb-4">
                <div class="flex-shrink-1 bg-dark rounded py-2 px-3">
					<div ${style}>
						${order}
					</div>
					${msg.msg}
					<div class="text-muted small text-nowrap mt-2" style='text-align: ${opp_sent};'>
						${msg.t}
					</div>
	            </div>
            </div>`;
}
function img_msg(msg, is_sender, name) {
	const sent = is_sender ? "right" : "left";
	const opp_sent = is_sender ? "left" : "right";
	const c = is_sender ? "r" : "l";
	const style = is_sender ? " style='text-align: right;'" : "";
	return `<div class="chat-message-${sent} pb-4">
                <div>
                </div>
                <div class="flex-shrink-1 bg-dark rounded py-2 px-3">
                <div ${style}><button class="usernames text-nowrap font-weight-bold mb-1" style="color: ${random_color(
		name
	)}">${name}</button><polkadot-web-identicon style="display: inline-block;" address="${
		msg.i
	}" theme="jdenticon" class="rounded-circle mr-1" size="25"></polkadot-web-identicon></div>
                    <img src="${msg.img}" class="responsive rounded">
					<div class="text-muted small text-nowrap mt-2" style='text-align: ${opp_sent};'>${
		msg.t
	}</div>
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
	const abbr = document.getElementById("abbr");
	const dept_abbr = abbr.innerHTML;
	socket = io("http://" + document.domain + ":" + location.port + "/chat");
	socket.on("connect", function () {
		abbr.innerHTML = dept_abbr;
		$("#chat").val("");
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
	socket.on('disconnect', function(){
		abbr.innerHTML = "Connecting ..."
	});
});
