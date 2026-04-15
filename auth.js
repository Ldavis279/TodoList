let currentUser = null;

document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('authEmail').value;
  const pass = document.getElementById('authPass').value;
  auth.signInWithEmailAndPassword(email, pass)
    .catch(err => {
      document.getElementById('authError').textContent = err.message;
    });
});

document.getElementById('registerBtn').addEventListener('click', () => {
  const email = document.getElementById('authEmail').value;
  const pass = document.getElementById('authPass').value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(cred => {
      return db.collection('user').doc(cred.user.uid).set({
        email: cred.user.email,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(err => {
      document.getElementById('authError').textContent = err.message;
    });
});

document.getElementById('signOutBtn').addEventListener('click', () => {
  auth.signOut();
});

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('signOutBtn').style.display = 'inline-block';
    loadTasksFromFirestore();
  } else {
    currentUser = null;
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('signOutBtn').style.display = 'none';
    tasks = [];
    render();
  }
});