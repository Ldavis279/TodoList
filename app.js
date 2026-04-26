let tasks = [];

// for date
const dateEl = document.getElementById('dateDisplay');
const now = new Date();
dateEl.textContent = now.toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric'
});

//getting tasks from database (firestore)
function loadTasksFromFirestore() {
  db.collection('task')
    .where('created_by', '==', currentUser.uid)
    .orderBy('created_at', 'desc')
    .onSnapshot(snapshot => {
      tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().name,
        description: doc.data().description || '',
        done: doc.data().is_complete || false,
        list_id: doc.data().list_id || '',
        created_at: doc.data().created_at
      }));
      render();
    }, err => {
      console.error('Firestore error:', err);
    });
}

// adding a task
function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text || !currentUser) return;

  db.collection('task').add({
    name: text,
    description: '',
    is_complete: false,
    created_by: currentUser.uid,
    list_id: '',
    created_at: firebase.firestore.FieldValue.serverTimestamp()
  });

  input.value = '';
}

document.getElementById('addBtn').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

function toggleDone(id) {
  const t = tasks.find(t => t.id === id);
  if (t) {
    db.collection('task').doc(id).update({
      is_complete: !t.done
    });
  }
}

function deleteTask(id) {
  db.collection('task').doc(id).delete();
}

//to edit a task
function startEdit(id, span, btn) {
  const isEditing = span.contentEditable === 'true';

  if (isEditing) {
    const newText = span.textContent.trim();
    if (newText) {
      db.collection('task').doc(id).update({ name: newText });
    }
    span.contentEditable = 'false';
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" 
        stroke="#888" stroke-width="2" stroke-linecap="round" 
        stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  } else {
    span.contentEditable = 'true';
    span.focus();
    const range = document.createRange();
    range.selectNodeContents(span);
    range.collapse(false);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"
     stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" 
     stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    span.onkeydown = e => {
      if (e.key === 'Enter') { e.preventDefault(); startEdit(id, span, btn); }
    };
  }
}

document.getElementById('clearDoneBtn').addEventListener('click', () => {
  const done = tasks.filter(t => t.done);
  const batch = db.batch();
  done.forEach(t => batch.delete(db.collection('task').doc(t.id)));
  batch.commit();
});


function render() {
  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  document.getElementById('emptyState').style.display = active.length === 0 ? 'block' : 'none';

  const total = tasks.length;
  const pct = total === 0 ? 0 : Math.round((done.length / total) * 100);
  const progressWrap = document.getElementById('progressWrap');
  progressWrap.style.display = total > 0 ? 'flex' : 'none';
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = pct + '%';

  const al = document.getElementById('activeList');
  al.innerHTML = '';
  active.forEach(t => al.appendChild(makeItem(t)));

  const dl = document.getElementById('doneList');
  const doneSection = document.getElementById('doneSection');
  doneSection.style.display = done.length > 0 ? 'block' : 'none';
  dl.innerHTML = '';
  done.forEach(t => dl.appendChild(makeItem(t)));
}

function makeItem(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.done ? ' done' : '');
  li.dataset.id = task.id;

  const check = document.createElement('button');
  check.className = 'check-btn' + (task.done ? ' checked' : '');
  check.title = task.done ? 'Mark undone' : 'Mark done';
  check.innerHTML = `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke-width="2.5" 
        stroke-linecap="round" stroke-linejoin="round"
        ><polyline points="1.5,6 5,9.5 10.5,2.5"/></svg>`;
  check.onclick = () => toggleDone(task.id);

  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;
  span.contentEditable = 'false';

  const actions = document.createElement('div');
  actions.className = 'action-btns';

  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn edit';
  editBtn.title = 'Edit';
  editBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" 
    stroke="#888" stroke-width="2" stroke-linecap="round" 
    stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  editBtn.onclick = () => startEdit(task.id, span, editBtn);

  const delBtn = document.createElement('button');
  delBtn.className = 'icon-btn del';
  delBtn.title = 'Delete';
  delBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" 
    stroke="#888" stroke-width="2" stroke-linecap="round" 
    stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
  delBtn.onclick = () => deleteTask(task.id);

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  li.appendChild(check);
  li.appendChild(span);
  li.appendChild(actions);
  return li;
}

  // ============ FILE UPLOAD ============
document.getElementById('uploadBtn').addEventListener('click', uploadFile);

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file || !currentUser) return;

  const statusEl = document.getElementById('uploadStatus');
  statusEl.textContent = 'Uploading...';

  const storageRef = storage.ref('uploads/' + currentUser.uid + '/' + file.name);
  const uploadTask = storageRef.put(file);

  uploadTask.on('state_changed',
    function(snapshot) {
      var pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      statusEl.textContent = 'Uploading... ' + pct + '%';
    },
    function(err) {
      statusEl.textContent = 'Upload failed: ' + err.message;
    },
    function() {
      uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
        db.collection('uploads').add({
          name: file.name,
          url: url,
          uploaded_by: currentUser.uid,
          uploaded_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        statusEl.textContent = 'Uploaded!';
        fileInput.value = '';
      });
    }
  );
}

function loadUploadedFiles() {
  if (!currentUser) return;
  db.collection('uploads')
    .where('uploaded_by', '==', currentUser.uid)
    .orderBy('uploaded_at', 'desc')
    .onSnapshot(function(snapshot) {
      var list = document.getElementById('fileList');
      list.innerHTML = '';
      snapshot.docs.forEach(function(doc) {
        var d = doc.data();
        var li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = '<span class="task-text"><a href="' + d.url + '" target="_blank" style="color:var(--accent);">' + d.name + '</a></span>';
        list.appendChild(li);
      });
    });
}
