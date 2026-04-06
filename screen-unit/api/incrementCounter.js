// import { initializeApp } from "firebase/app";
// import { getFirestore, doc, setDoc, increment, getDoc } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// export default async function handler(req, res) {
//   try {
//     const counterRef = doc(db, "COUNTER", "VISITS");

//     // نجيب الداتا الحالية
//     const snap = await getDoc(counterRef);

//     if (!snap.exists()) {
//       // لو المستند مش موجود نعمله بصفر
//       await setDoc(counterRef, { COUNT: 1 });
//     } else {
//       // لو موجود، نزود العداد
//       await setDoc(counterRef, { COUNT: increment(1) }, { merge: true });
//     }

//     // نجيب البيانات بعد التحديث
//     const updatedSnap = await getDoc(counterRef);

//     // نرجع العدد الحالي
//     res.status(200).json({ count: updatedSnap.data().COUNT });

//   } catch (err) {
//     console.error("Firebase Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// }

import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, increment, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    const counterRef = doc(db, "COUNTER", "VISITS");

    // نزود العدد
    await updateDoc(counterRef, {COUNT: increment(1) });

    // نجيب العدد بعد التحديث
    const snap = await getDoc(counterRef);
    const currentCount = snap.data()?.COUNT || 0; // لو الحقل مش موجود يبدأ من 0

    res.status(200).json({ COUNT: currentCount });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).json({ error: err.message });
  }
}
