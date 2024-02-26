/* global browser */

let rootNodeName = "root";

function getTimeStampStr() {
  const d = new Date();
  let ts = "";
  [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate() + 1,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
  ].forEach((t, i) => {
    ts = ts + (i !== 3 ? "-" : "_") + (t < 10 ? "0" : "") + t;
  });
  return ts.substring(1);
}

browser.menus.create({
  title: "Export as Text",
  contexts: ["bookmark"],
  visible: true,
  onclick: async function (info /*, tab*/) {
    if (info.bookmarkId) {
      try {
        const tmp = (await browser.bookmarks.getSubTree(info.bookmarkId))[0];
        rootNodeName = tmp.title || "";
        exportData(recGetBookmarkUrls(tmp, 0));
      } catch (e) {
        console.error(e);
      }
    }
  },
});

function recGetBookmarkUrls(bookmarkItem, depth) {
  let urls = [];
  if (bookmarkItem.url) {
    urls.push(
      " ".repeat(depth) + " " + bookmarkItem.title + " : " + bookmarkItem.url
    );
  } else if (bookmarkItem.children) {
    urls.push(" ".repeat(depth) + "> " + bookmarkItem.title);
    for (var child of bookmarkItem.children) {
      urls = urls.concat(recGetBookmarkUrls(child, depth + 1));
    }
  }
  return urls;
}

// max foldername length is 128 characters 2^7
function genDLFilename() {
  return (
    "bookmarks_" +
    rootNodeName.substr(0, 128) +
    "_" +
    getTimeStampStr() +
    ".txt"
  );
}

function exportData(urls) {
  const content = urls.join("\n");
  let dl = document.createElement("a");
  let textFileAsBlob = new Blob([content], { type: "text/plain" });
  dl.setAttribute("href", window.URL.createObjectURL(textFileAsBlob));
  dl.setAttribute("download", genDLFilename());
  dl.setAttribute("visibility", "hidden");
  dl.setAttribute("display", "none");
  document.body.appendChild(dl);
  dl.click();
  document.body.removeChild(dl);
}

browser.browserAction.onClicked.addListener(async (/*tab*/) => {
  try {
    const tmp = (await browser.bookmarks.getTree())[0];
    rootNodeName = "root";
    exportData(recGetBookmarkUrls(tmp, 1));
  } catch (e) {
    console.error(e);
  }
});
