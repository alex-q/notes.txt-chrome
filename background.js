/**
 * Background job.
 *
 * @author alexander
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({url: chrome.runtime.getURL('index.html')});
});
