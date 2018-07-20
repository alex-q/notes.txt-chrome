/**
 * Page script.
 *
 * @author alexander
 */
const filename = 'notes.txt';
const title = filename;
const saveDelay = 2500;
let fileId;
let drive;

window.onload = () => {
  gapi.load('client', gapiOnLoad);

  let textElem = document.getElementById('text');
  let currentTimer = null;

  setSaved(true);
  textElem.disabled = true;
  textElem.onkeypress = changed;
  textElem.onpaste = changed;

  function changed() {
    console.log('Text changed.');
    setSaved(false);

    if (currentTimer != null)
      clearTimeout(currentTimer);

    currentTimer = setTimeout(saveNotes, saveDelay);
  }

  function setSaved(isSaved) {
    document.title = title + (isSaved ? '' : '*');
  }

  function setTextAndEnable(s) {
    textElem.value = s;
    textElem.disabled = false;
  }

  function gapiOnLoad() {
    gapiAuth(() => {
      drive = gapi.client.drive;
      loadNotes();
    });
  }

  function gapiAuth(onComplete) {
    if (gapi.auth.getToken()) {
      onComplete();

    } else {
      chrome.identity.getAuthToken({'interactive': true}, token => {
        gapiToken = token;

        if (token) {
          gapi.auth.setToken({'access_token': token});
          gapi.client.load('drive', 'v3', onComplete);
        } else {
          console.error('No token :(');
        }
      });
    }
  }

  function gapiReAuth(onComplete) {
    chrome.identity.removeCachedAuthToken(
      {token: gapi.auth.getToken().access_token},
      () => gapiAuth(onComplete)
    );
  }

  function loadNotes() {
    drive.files.list({
      spaces: 'appDataFolder',
      q: `name = '${filename}'`
    }).then(r => {
      if (r.result.files.length) {
        console.log('File found.');
        let id = r.result.files[0].id;
        return Promise.resolve({result: {id: id}});

      } else {
        console.log('New file.');
        return drive.files.create({
          resource: {
            name: filename,
            parents: ['appDataFolder']
          },
          fields: 'id'
        });
      }
    }).then(r => {
      fileId = r.result.id;
      return drive.files.get({
        fileId: fileId,
        alt: 'media'
      });
    }).then(r => {
      setTextAndEnable(r.body);
    }).catch(e => {
      if (e.status === 401)
        gapiReAuth(loadNotes);
      else
        console.error(e);
    });
  }

  function saveNotes() {
    console.log('Saving text...');
    let text = textElem.value;
    let blob = new Blob([text], {type: 'text/plain'});

    updateFile(fileId, blob, () => {
      console.log('Saved.');
      setSaved(true);
    });
  }

  function updateFile(fileId, contentBlob, onComplete) {
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE)
        onComplete(xhr.response);
    };
    xhr.open('PATCH', `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`);
    xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
    xhr.send(contentBlob);
  }
};
