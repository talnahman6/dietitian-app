import React, { useMemo, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const miri = require('../assets/miri-main.webp');

const baseFoods = [
  { n: 'חזה עוף', cal: 165, p: 31, c: 0, f: 3.6 },
  { n: 'אורז לבן', cal: 130, p: 2.7, c: 28, f: 0.3 },
  { n: 'ביצה', cal: 143, p: 13, c: 1.1, f: 10 },
  { n: 'קוטג 5%', cal: 98, p: 11, c: 3, f: 5 },
  { n: 'אבוקדו', cal: 160, p: 2, c: 9, f: 15 },
];

const meals = [
  ['breakfast', 'בוקר'],
  ['lunch', 'צהריים'],
  ['snack', 'ביניים'],
  ['dinner', 'ערב'],
  ['night', 'לילה'],
];

const defaultProfile = { firstName: 'טל', gender: 'male', cal: 1800, protein: 135, carbs: 180, fat: 60 };

export default function App() {
  const [profile, setProfile] = useState(defaultProfile);
  const [onboarding, setOnboarding] = useState(true);
  const [tab, setTab] = useState('home');
  const [log, setLog] = useState([]);
  const [food, setFood] = useState('');
  const [grams, setGrams] = useState('100');
  const [meal, setMeal] = useState('breakfast');

  const totals = useMemo(() => log.reduce((a, x) => ({
    cal: a.cal + x.cal,
    protein: a.protein + x.p,
    carbs: a.carbs + x.c,
    fat: a.fat + x.f,
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 }), [log]);

  const addFood = () => {
    const found = baseFoods.find(x => x.n === food) || baseFoods.find(x => x.n.includes(food));
    const g = Number(grams) || 0;
    if (!found || !g) return;
    setLog([{ ...found, id: Date.now(), meal, grams: g, cal: Math.round(found.cal * g / 100), p: +(found.p * g / 100).toFixed(1), c: +(found.c * g / 100).toFixed(1), f: +(found.f * g / 100).toFixed(1) }, ...log]);
    setFood('');
  };

  if (onboarding) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.onboarding}>
          <Text style={styles.title}>מה המין שלך?</Text>
          <Text style={styles.subtitle}>נשתמש בזה לחישוב מדויק יותר</Text>
          <View style={styles.genderRow}>
            {['male', 'female'].map(g => (
              <Pressable key={g} onPress={() => setProfile({ ...profile, gender: g })} style={[styles.genderCard, profile.gender === g && styles.selected]}>
                <Text style={styles.genderIcon}>{g === 'male' ? '👨' : '👩'}</Text>
                <Text style={styles.genderText}>{g === 'male' ? 'זכר' : 'נקבה'}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput value={profile.firstName} onChangeText={firstName => setProfile({ ...profile, firstName })} style={styles.input} placeholder="שם פרטי" />
          <Pressable onPress={() => setOnboarding(false)} style={styles.primaryBtn}><Text style={styles.primaryText}>הבא</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={miri} style={styles.avatar} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>מירי הדיאטנית</Text>
            <Text style={styles.heroTitle}>האישית שלך</Text>
            <Text style={styles.hello}>שלום, {profile.firstName}</Text>
          </View>
        </View>

        {tab === 'home' && <Home totals={totals} profile={profile} food={food} setFood={setFood} grams={grams} setGrams={setGrams} meal={meal} setMeal={setMeal} addFood={addFood} />}
        {tab === 'journal' && <Journal log={log} setLog={setLog} />}
        {tab === 'menus' && <Menus profile={profile} />}
        {tab === 'profile' && <Profile profile={profile} setProfile={setProfile} />}
      </ScrollView>
      <View style={styles.nav}>
        {[
          ['profile', 'אזור אישי', '👤'],
          ['journal', 'היומן שלי', '📅'],
          ['menus', 'תפריטים', '📋'],
          ['home', 'ראשי', '🏠'],
        ].map(item => (
          <Pressable key={item[0]} onPress={() => setTab(item[0])} style={[styles.navItem, tab === item[0] && styles.navActive]}>
            <Text style={styles.navIcon}>{item[2]}</Text>
            <Text style={styles.navText}>{item[1]}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function Home({ totals, profile, food, setFood, grams, setGrams, meal, setMeal, addFood }) {
  return (
    <>
      <View style={styles.stats}>
        <Stat label="קלוריות" value={`${totals.cal}/${profile.cal}`} />
        <Stat label="חלבונים" value={`${Math.round(totals.protein)}g`} />
        <Stat label="פחמימות" value={`${Math.round(totals.carbs)}g`} />
        <Stat label="שומנים" value={`${Math.round(totals.fat)}g`} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>מה אכלת היום? 😊</Text>
        <TextInput value={food} onChangeText={setFood} style={styles.input} placeholder="לדוגמה: אורז לבן" />
        <View style={styles.row}>
          <TextInput value={grams} onChangeText={setGrams} keyboardType="numeric" style={[styles.input, styles.smallInput]} placeholder="כמות" />
          <View style={styles.select}>{meals.map(x => <Pressable key={x[0]} onPress={() => setMeal(x[0])}><Text style={[styles.choice, meal === x[0] && styles.choiceActive]}>{x[1]}</Text></Pressable>)}</View>
        </View>
        <Pressable onPress={addFood} style={styles.primaryBtn}><Text style={styles.primaryText}>הוספה</Text></Pressable>
      </View>
    </>
  );
}

function Stat({ label, value }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function Journal({ log, setLog }) {
  return <View style={styles.card}><Text style={styles.cardTitle}>יומן האכילה שלי</Text>{log.map(x => <View key={x.id} style={styles.foodRow}><Text>{x.n} - {x.grams} גרם</Text><Pressable onPress={() => setLog(log.filter(i => i.id !== x.id))}><Text style={styles.delete}>מחק</Text></Pressable></View>)}</View>;
}

function Menus({ profile }) {
  return <View style={styles.card}><Text style={styles.cardTitle}>התפריטים שלי</Text>{[1, 2, 3].map(i => <View key={i} style={styles.menuBox}><Text style={styles.menuTitle}>תפריט מס {i}</Text><Text>בוקר, צהריים, ביניים, ערב ולילה</Text><Text>סה"כ יומי: {profile.cal} קלוריות</Text></View>)}</View>;
}

function Profile({ profile, setProfile }) {
  return <View style={styles.card}><Text style={styles.cardTitle}>אזור אישי</Text><TextInput value={profile.firstName} onChangeText={firstName => setProfile({ ...profile, firstName })} style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f5ef', direction: 'rtl' },
  content: { padding: 18, paddingBottom: 110, gap: 16 },
  onboarding: { flex: 1, justifyContent: 'center', padding: 26, gap: 18 },
  title: { fontSize: 34, fontWeight: '900', textAlign: 'center', color: '#1f2430' },
  subtitle: { fontSize: 18, textAlign: 'center', color: '#73777f' },
  genderRow: { flexDirection: 'row', gap: 14 },
  genderCard: { flex: 1, height: 130, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2ded5' },
  selected: { backgroundColor: '#e7e7e7', borderColor: '#47a07f' },
  genderIcon: { fontSize: 34 },
  genderText: { fontSize: 20, fontWeight: '800', color: '#27303a' },
  hero: { minHeight: 190, borderRadius: 30, backgroundColor: '#3f987b', flexDirection: 'row-reverse', alignItems: 'center', padding: 18, gap: 14 },
  avatar: { width: 118, height: 118, borderRadius: 59, borderWidth: 5, borderColor: '#dfe9d5' },
  heroText: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'right' },
  hello: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 10, textAlign: 'right' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '48%', backgroundColor: '#fff', borderRadius: 24, padding: 22, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#47a07f' },
  statLabel: { color: '#6d7280', fontSize: 16, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 26, padding: 18, gap: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  cardTitle: { fontSize: 23, fontWeight: '900', color: '#2c3140', textAlign: 'right' },
  input: { height: 58, backgroundColor: '#f2eee8', borderRadius: 16, paddingHorizontal: 16, fontSize: 18, textAlign: 'right' },
  row: { flexDirection: 'row', gap: 10 },
  smallInput: { width: 110 },
  select: { flex: 1, flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  choice: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#f2eee8', borderRadius: 12, color: '#707782', fontWeight: '800' },
  choiceActive: { backgroundColor: '#47a07f', color: '#fff' },
  primaryBtn: { height: 58, borderRadius: 17, backgroundColor: '#47a07f', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 21, fontWeight: '900' },
  foodRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  delete: { color: '#d65a5a', fontWeight: '800' },
  menuBox: { backgroundColor: '#f8f8f8', borderRadius: 18, padding: 14, gap: 5 },
  menuTitle: { fontSize: 19, fontWeight: '900', color: '#47a07f' },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 84, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 78, height: 72, borderTopLeftRadius: 42, borderTopRightRadius: 42 },
  navActive: { backgroundColor: '#dff4ec' },
  navIcon: { fontSize: 22 },
  navText: { fontSize: 13, fontWeight: '800', color: '#5f6570' },
});
