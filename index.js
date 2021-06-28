let simpleParser = require("mailparser").simpleParser;
let Imap = require('imap');
let fs = require('fs'),
  inspect = require('util').inspect;

const { DownloaderHelper } = require('node-downloader-helper');
const https = require('https'); // or 'https' for https:// URLs

const isPhone = (phone) => {
  const regEx = /(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})/;
  let plist = phone.match(regEx);
  if (plist != null && plist.length != 0) {
    return plist[0];
  }
};

const isEmail = (email) => {
  const regEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (email.match(regEx)) {
    console.log(email.match(regEx)[0])
    return true;
  }
  else return false;
};

let imap = new Imap({
  user: 'vietphamtesting@gmail.com',
  password: 'mihnov-niktic-Wewgo2',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false
  }
});

let emailBody = '';
let emailSubject = '';

const getMailBody = async () => {
  const promise = () => new Promise((resolve, reject) => {
    imap.once('ready', function (err) {
      if (err) console.log(err);
      imap.openBox('INBOX', false, function (err_1, box) {
        if (err_1) console.log(err_1);
        imap.search(["UNSEEN", ['SINCE', 'JUNE 21, 2021']], (err_2, uids) => {
          if (err_2) console.log(err_2);
          let fetch = imap.fetch(uids, { bodies: [''] });
          fetch.on('message', function (msg, seqno) {
            msg.on('body', function (stream, info) {
              simpleParser(stream, function (err_3, body) {
                emailBody = body.text;
                emailSubject = body.subject;
              });
            });
            imap.end();
          });
        });
      });
    });
    imap.once('end', (err) => {
      if (err) console.log(err);
      emailBody = emailBody.split("\n");
      console.log(emailSubject.replace("New application: ", "").split(" from "));
      let link = '';
      for (let i = 0; i < emailBody.length; i++) {
        if (emailBody[i].includes('Download')) {
          link = emailBody[i + 1];
          break;
        }
      }
      link = link.replace(/>|<| /g, "");
      resolve(link);
    });
    imap.connect();
  });

  const result = await promise();
  console.log(result);

  const dl = new DownloaderHelper('https://www.researchgate.net/profile/Alexander-White/publication/262934023_The_Elements_of_Graphic_Design_Second_Edition/links/0f3175395c71205e7f000000/The-Elements-of-Graphic-Design-Second-Edition.pdf?origin=publication_detail', './resume');
  dl.on('end', () => console.log('Download Completed'))
  dl.start();

}

getMailBody();


