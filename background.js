/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

function getTimeStampStr() {
    const d = new Date();
    let ts = "";
    [   d.getFullYear(), d.getMonth()+1, d.getDate()+1,
        d.getHours(), d.getMinutes(), d.getSeconds()].forEach( (t,i) => {
        ts = ts + ((i!==3)?"-":"_") + ((t<10)?"0":"") + t;
    });
    return ts.substring(1);
}

browser.menus.create({
    title: 'Export as Text',
    contexts: ["bookmark"],
    visible: true,
    onclick: async function(info /*, tab*/) {
        if(info.bookmarkId ) {
            try {
                const tmp = (await browser.bookmarks.getSubTree(info.bookmarkId))[0];
                exportData(recGetBookmarkUrls(tmp,0));
            }catch(e){
                console.error(e);
            }
        }
    }
});

function recGetBookmarkUrls(bookmarkItem,depth){
	let urls = [];
	if(bookmarkItem.url){
		urls.push(" ".repeat(depth) + " " + bookmarkItem.title + " : " + bookmarkItem.url);
	}else
	if(bookmarkItem.children){
        urls.push(" ".repeat(depth) + "> " + bookmarkItem.title);
		for(var child of bookmarkItem.children){
			urls = urls.concat(recGetBookmarkUrls(child,depth+1));
		}
	}
	return urls;
}

function exportData(urls){
    const content = urls.join("\n");
    let dl = document.createElement('a');
    const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    dl.setAttribute('href', href);
    dl.setAttribute('download', getTimeStampStr() + '_bookmarks.txt');
    dl.setAttribute('visibility', 'hidden');
    dl.setAttribute('display', 'none');
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
}


browser.browserAction.onClicked.addListener(async (/*tab*/) => {
    try {
        const tmp = (await browser.bookmarks.getTree())[0];
        exportData(recGetBookmarkUrls(tmp,1));
    }catch(e){
        console.error(e);
    }
});
