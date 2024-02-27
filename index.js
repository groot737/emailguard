const dns = require("dns");
const net = require("net");

function verifyEmail(email, callback) {
  const domain = email.split("@")[1];

  dns.resolveMx(domain, (err, addresses) => {
    if (err || addresses.length === 0) {
      callback(false);
      return;
    }

    const mailServer = addresses[0].exchange;
    const socket = net.createConnection(25, mailServer);

    socket.on("connect", () => {
      socket.write("HELO example.com\r\n");
      socket.write(`MAIL FROM:<verify@example.com>\r\n`);
      socket.write(`RCPT TO:<${email}>\r\n`);
      socket.write("QUIT\r\n");
    });

    socket.on("data", (data) => {
      const response = data.toString();

      if (response.includes("250")) {
        callback(true);
      } else {
        callback(false);
      }
      socket.end();
    });
  });
}

module.exports = { verifyEmail };
