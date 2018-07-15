/**
 * Page script.
 *
 * @author alexander
 */
const title = 'notes.txt';
const saveDelay = 1000;

window.onload = () => {
  console.log('Loaded.');
  const textElem = document.getElementById('text');
  let currentTimer = null;

  setSaved(true);
  textElem.disabled = true;
  textElem.value = 'Loading...';

  chrome.storage.local.get('text', result => {
    console.log('Storage read.');
    textElem.disabled = false;
    textElem.value = '';
    
    if (result['text'] != null)
      textElem.value = result['text'];

    textElem.onkeypress = changed;
    textElem.onpaste = changed;
  });

  function changed() {
    console.log('Text changed.');
    setSaved(false);

    if (currentTimer != null)
      clearTimeout(currentTimer);

    currentTimer = setTimeout(() => {
      console.log('Text saving...');
      chrome.storage.local.set({text: textElem.value}, () => {
        setSaved(true);
      });
    }, saveDelay);
  }

  function setSaved(isSaved) {
    document.title = title + (isSaved ? '' : '*');
  }
};
