"use client";

import { useMemo, useState } from "react";

const audiences = [
  { number: "01", title: "الفنادق والمنتجعات", text: "تنبؤ مبكر بالفائض، خفض تكلفة التخلص، وتقارير أثر موثّقة." },
  { number: "02", title: "المطاعم والمطابخ المركزية", text: "قرار إنتاج أدق وربط مرن حتى عند اختلاف الأنظمة والفروع." },
  { number: "03", title: "الجمعيات وبنوك الطعام", text: "مهام استلام منظمة بحسب الموقع والوقت والقدرة التشغيلية." },
];

const workflow = [
  ["01", "الوعي الاستباقي — ONS", "يعتمد رفد على الذكاء الاصطناعي في التنبؤ بالفائض بشكل استباقي بناءً على الحضور والاستهلاك."],
  ["02", "اتخاذ القرار", "يقوم مشرف البوفيه بمراجعة الفائض المتوقع واتخاذ القرار بشأن التبرع به ورفع الطلب."],
  ["03", "المطابقة الذكية", "نقوم بالمطابقة بين الفائض والجمعية الأنسب لتتلقى إشعاراً للقبول وتأكيد الاستلام."],
  ["04", "قياس الأثر", "يجمع رفد البيانات لتحليل العمليات وقياس الأثر وتحسين دقة تنبؤات الذكاء الاصطناعي."],
];

const team = [
  { initials: "ف ع", name: "فجر العنزي", role: "الذكاء الاصطناعي", bio: "متخصصة في الذكاء الاصطناعي وتقنياته التوليدية، ومطورة حلول تقنية وابتكارات ذكية." },
  { initials: "ج ش", name: "جواد آل شيخ", role: "الأمن والواجهات", bio: "متخصص في الأمن السيبراني وبناء الواجهات وتجارب المستخدم الآمنة والسلسة." },
  { initials: "م ف", name: "منال الفهمي", role: "المنتج والأثر", bio: "رائدة أعمال وباحثة اجتماعية، حاصلة على العديد من الجوائز." },
  { initials: "ف ح", name: "فاطمة الحداد", role: "الاستدامة والابتكار", bio: "مهندسة كيميائية، مشاركة في برامج وكالة البحرين للفضاء، ومهتمة بتطوير الحلول المستدامة." },
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a className={`brand ${light ? "brand-light" : ""}`} href="#top" aria-label="رفد - الصفحة الرئيسية">
      <img src="/rafd/logo-mark.png" alt="" aria-hidden="true" />
      <span>رَفْد</span>
    </a>
  );
}

export default function Home() {
  const [demoView, setDemoView] = useState<"facility" | "charity" | "impact">("facility");
  const [expectedAttendees, setExpectedAttendees] = useState(250);
  const [actualConsumption, setActualConsumption] = useState(180);
  const [missionCreated, setMissionCreated] = useState(false);
  const [missionAccepted, setMissionAccepted] = useState(false);

  // المعادلة: الاكل الفائض = عدد الحضور المتوقع - الاستهلاك الفعلي
  const forecast = useMemo(
    () => Math.max(0, expectedAttendees - actualConsumption),
    [expectedAttendees, actualConsumption],
  );
  const weight = (forecast * 0.5).toFixed(1);
  const confidence = Math.max(76, Math.min(99, Math.round(95 - Math.abs(expectedAttendees - 200) * 0.05)));

  function createMission() {
    setMissionCreated(true);
    window.setTimeout(() => setDemoView("charity"), 450);
  }

  function acceptMission() {
    setMissionAccepted(true);
    window.setTimeout(() => setDemoView("impact"), 800);
  }

  return (
    <main id="top">
      <header className="site-header">
        <div className="shell header-inner">
          <Brand />
          <nav aria-label="التنقل الرئيسي">
            <a href="#idea">الفكرة</a><a href="#how">كيف تعمل؟</a><a href="#ai">الذكاء الاصطناعي</a><a href="#impact">الأثر</a>
          </nav>
          <a className="button button-small" href="#demo">جرّب رفد</a>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-photo" role="img" aria-label="فريق ضيافة يجهّز وجبات فائضة للاستلام" />
        <div className="hero-overlay" />
        <div className="shell hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span /> منصة تنبؤ وربط للفائض الغذائي</p>
            <h1 id="hero-title">أنقذ الفائض<br />قبل أن يصبح هدرًا.</h1>
            <p className="hero-lead">رفد يتنبأ بكمية الطعام المتبقي قبل نهاية الخدمة، ثم يربط المنشأة بالجمعية المناسبة في نافذة استلام آمنة وموثقة.</p>
            <div className="hero-actions">
              <a className="button button-gold" href="#demo">استكشف التجربة</a>
              <a className="text-link" href="#how">شاهد طريقة العمل <span aria-hidden="true">←</span></a>
            </div>
          </div>
          <aside className="forecast-float" aria-label="مثال لتنبؤ رفد">
            <div className="forecast-top"><span className="live-dot" /><span>تنبؤ خدمة العشاء</span><strong>الآن</strong></div>
            <div className="forecast-main">
              <div><span>الفائض المتوقع</span><strong>{forecast}</strong><small>وجبة</small></div>
              <div className="confidence-ring" aria-label={`دقة متوقعة ${confidence} بالمئة`}><span>{confidence}%</span><small>ثقة</small></div>
            </div>
            <div className="forecast-footer"><span>نافذة الاستلام</span><strong>8:45 – 9:15 م</strong></div>
          </aside>
        </div>
      </section>

      <section className="proof-strip" aria-label="حجم المشكلة">
        <div className="shell proof-grid">
          <div><strong>27.9%</strong><span>معدل الفقد والهدر الغذائي</span></div>
          <div><strong>40B</strong><span>ريال تكلفة اقتصادية سنوية تقديرية</span></div>
          <div><strong>+2h</strong><span>قرار استباقي قبل نهاية الخدمة</span></div>
          <p>رفد لا ينتظر الهدر كي يقيسه؛ بل يمنح فرق التشغيل وقتًا لمنعه.</p>
        </div>
      </section>

      <section className="section audience-section" id="idea">
        <div className="shell">
          <div className="section-heading split-heading">
            <div><p className="eyebrow dark"><span /> لمن صُمّم رفد؟</p><h2>من قرار المطبخ<br />إلى أثر مجتمعي.</h2></div>
            <p>منصة واحدة تجمع الطرف الذي يملك البيانات والطعام مع الطرف القادر على استلامه وتوزيعه بكفاءة.</p>
          </div>
          <div className="audience-grid">
            {audiences.map((item) => (
              <article className="audience-card" key={item.number}>
                <span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p><div className="card-line" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section workflow-section" id="how">
        <div className="shell workflow-layout">
          <div className="workflow-sticky">
            <p className="eyebrow light"><span /> رحلة المستخدم في رفد</p>
            <h2>أربع خطوات.<br />قرار واحد موثّق.</h2>
            <p>طريقة الربط تتم عن طريق مشرف البوفيه ليرفع طلب ليصل تنبيه للجمعية المناسبة، مع قياس مستمر للأثر.</p>
            <a href="#demo" className="button button-outline">شغّل النموذج التجريبي</a>
          </div>
          <div className="workflow-list">
            {workflow.map(([number, title, text]) => (
              <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section ai-section" id="ai">
        <div className="shell ai-layout">
          <div className="ai-image-wrap">
            <img src="/rafd/forecast.png" alt="مدير ضيافة يعرض تنبؤ رفد على الهاتف" />
            <div className="ai-badge"><strong>MAPE ≤20%</strong><span>هدف التجربة الأولى</span></div>
          </div>
          <div className="ai-copy">
            <p className="eyebrow dark"><span /> ذكاء اصطناعي له دور ضروري</p>
            <h2>يتعلم من التشغيل،<br />ولا يستبدل المسؤول.</h2>
            <p>يحلل رفد تاريخ المبيعات والإشغال والطقس وتوقيت الخدمة. يعرض الكمية المتوقعة ومستوى الثقة، ويبقى اعتماد المهمة بيد المسؤول.</p>
            <ul>
              <li><span>01</span><div><strong>الوعي الاستباقي</strong><small>توقع الفائض قبل النهاية</small></div></li>
              <li><span>02</span><div><strong>معادلة بسيطة</strong><small>الحضور المتوقع - الاستهلاك الفعلي</small></div></li>
              <li><span>03</span><div><strong>قرار مضبوط</strong><small>تنبيه ومراجعة بشرية وسجل تدقيق واضح</small></div></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="demo-section section" id="demo">
        <div className="shell">
          <div className="demo-heading">
            <div><p className="eyebrow dark"><span /> نموذج تشغيلي تفاعلي</p><h2>غيّر البيانات، وشاهد<br />كيف يتحرك القرار.</h2></div>
            <p>هذا النموذج يوضح رحلة الـPilot: قراءة البيانات، تقدير الفائض، مراجعة المسؤول، المطابقة مع الجمعية، ثم قياس الأثر.</p>
          </div>

          <div className="demo-shell">
            <div className="demo-toolbar">
              <div className="demo-brand"><img src="/rafd/logo-mark.png" alt="" /><div><strong>لوحة رفد</strong><small>رحلة المستخدم الكاملة</small></div></div>
              <div className="view-switch" role="tablist" aria-label="تبديل جهة العرض">
                <button className={demoView === "facility" ? "active" : ""} onClick={() => setDemoView("facility")} role="tab" aria-selected={demoView === "facility"}>1. المنشأة</button>
                <button className={demoView === "charity" ? "active" : ""} onClick={() => setDemoView("charity")} role="tab" aria-selected={demoView === "charity"}>2. الجمعية</button>
                <button className={demoView === "impact" ? "active" : ""} onClick={() => setDemoView("impact")} role="tab" aria-selected={demoView === "impact"}>3. الأثر</button>
              </div>
              <div className="system-status"><span /> البيانات مدققة</div>
            </div>

            {demoView === "facility" ? (
              <div className="facility-demo" role="tabpanel">
                <div className="controls-panel">
                  <div className="panel-title"><div><span>بيانات الخدمة</span><strong>الوعي الاستباقي — ONS</strong></div><small>تحديث لحظي</small></div>
                  <label><span><b>عدد الحضور المتوقع</b><strong>{expectedAttendees}</strong></span><input type="range" min="50" max="500" value={expectedAttendees} onChange={(event) => { setExpectedAttendees(Number(event.target.value)); setMissionCreated(false); }} /></label>
                  <label><span><b>الاستهلاك الفعلي (مرات الشراء)</b><strong>{actualConsumption}</strong></span><input type="range" min="10" max="500" value={actualConsumption} onChange={(event) => { setActualConsumption(Number(event.target.value)); setMissionCreated(false); }} /></label>
                  <div className="equation-display" style={{ marginTop: '24px', padding: '16px', background: '#f8f1e9', borderRadius: '12px', fontSize: '15px', color: '#681c38', fontWeight: 700, borderRight: '4px solid #7a263f' }}>المعادلة: الأكل الفائض = عدد الحضور المتوقع - الاستهلاك الفعلي</div>
                  <div className="data-foot"><span>POS</span><span>ONS</span><small>آخر مزامنة: الآن</small></div>
                </div>

                <div className="prediction-panel">
                  <div className="panel-title"><div><span>تنبؤ النموذج</span><strong>اتخاذ القرار والمطابقة</strong></div><small className="ai-pill">AI</small></div>
                  <div className="prediction-number"><strong>{forecast}</strong><span>وجبة</span><small>≈ {weight} كجم</small></div>
                  <div className="confidence-row"><span>مستوى الثقة</span><div><i style={{ width: `${confidence}%` }} /></div><strong>{confidence}%</strong></div>
                  <div className="prediction-details"><div><span>نافذة التحرك</span><strong>قبل نهاية الخدمة بـ 1:52</strong></div><div><span>الاستلام المقترح</span><strong>8:45 – 9:15 م</strong></div></div>
                  <button className="button demo-action" onClick={createMission}>{missionCreated ? "تم رفع الطلب بنجاح ✓" : "اعتماد الطلب والمطابقة"}</button>
                  <p className="human-note"><span>✓</span> عند الاعتماد، سيقوم النظام بمطابقة ذكية للجمعية الأنسب.</p>
                </div>
              </div>
            ) : demoView === "charity" ? (
              <div className="charity-demo" role="tabpanel">
                <div className="charity-summary">
                  <p className="status-kicker"><span /> طلب مطابق متاح الآن</p>
                  <h3>{missionCreated ? `${forecast} وجبة جاهزة للاستلام` : "لا يوجد طلب مطابق بعد"}</h3>
                  <p>{missionCreated ? "تمت المطابقة الذكية بناءً على البيانات والمعايير المحددة (السعة، المسافة)." : "ارجع إلى تبويب المنشأة وارفع الطلب أولًا."}</p>
                  <div className="charity-stats"><div><span>المسافة</span><strong>3.8 كم</strong></div><div><span>وقت الوصول</span><strong>12 دقيقة</strong></div><div><span>الوزن المتوقع</span><strong>{weight} كجم</strong></div></div>
                </div>
                <div className={`mission-card ${missionCreated ? "available" : "disabled"}`}>
                  <div className="mission-map"><span className="map-point origin">المنشأة</span><i /><span className="map-point destination">الجمعية</span></div>
                  <div className="mission-info"><div><span>الوجهة</span><strong>جمعية حفظ النعمة</strong></div><div><span>المركبة</span><strong>صندوقان معزولان</strong></div><div><span>التوثيق</span><strong>وزن + وقت</strong></div></div>
                  <button className="button demo-action" disabled={!missionCreated || missionAccepted} onClick={acceptMission}>{missionAccepted ? "تم تأكيد الاستلام ✓" : "قبول وتأكيد الاستلام"}</button>
                </div>
              </div>
            ) : (
              <div className="impact-demo" role="tabpanel" style={{ minHeight: '520px', padding: '38px', background: 'linear-gradient(135deg, #fffaf4, #f4e7e9)' }}>
                <div className="impact-dashboard" style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 12px 40px rgba(74,16,40,0.08)' }}>
                  <div className="dashboard-header" style={{ marginBottom: '30px', borderBottom: '1px solid #eadbdc', paddingBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: '28px', color: '#4a1028' }}>قياس الأثر وتحليل البيانات</h3>
                    <p style={{ margin: 0, color: '#75646b', lineHeight: 1.6 }}>يتم جمع وتحليل البيانات الناتجة عن العمليات لقياس الأثر وتحسين دقة التنبؤ</p>
                  </div>
                  <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div className="metric-box" style={{ padding: '20px', background: '#fffdf9', borderRadius: '16px', border: '1px solid #dfcdd1' }}>
                      <span style={{ display: 'block', color: '#75646b', fontSize: '12px', marginBottom: '8px' }}>كمية الفائض الغذائي</span>
                      <strong style={{ fontSize: '32px', color: '#7a263f' }}>{missionAccepted ? weight : "0.0"} <small style={{ fontSize: '16px', color: '#75646b' }}>كجم</small></strong>
                    </div>
                    <div className="metric-box" style={{ padding: '20px', background: '#fffdf9', borderRadius: '16px', border: '1px solid #dfcdd1' }}>
                      <span style={{ display: 'block', color: '#75646b', fontSize: '12px', marginBottom: '8px' }}>الوجبات المنقذة</span>
                      <strong style={{ fontSize: '32px', color: '#d9a93a' }}>{missionAccepted ? forecast : "0"}</strong>
                    </div>
                    <div className="metric-box" style={{ padding: '20px', background: '#fffdf9', borderRadius: '16px', border: '1px solid #dfcdd1' }}>
                      <span style={{ display: 'block', color: '#75646b', fontSize: '12px', marginBottom: '8px' }}>دقة التنبؤ بالذكاء الاصطناعي</span>
                      <strong style={{ fontSize: '32px', color: '#4a1028' }}>{confidence}%</strong>
                    </div>
                    <div className="metric-box" style={{ padding: '20px', background: '#fffdf9', borderRadius: '16px', border: '1px solid #dfcdd1' }}>
                      <span style={{ display: 'block', color: '#75646b', fontSize: '12px', marginBottom: '8px' }}>عدد عمليات الربط (المنشآت والجمعيات)</span>
                      <strong style={{ fontSize: '32px', color: '#4a1028' }}>{missionAccepted ? "1" : "0"}</strong>
                    </div>
                  </div>
                  {missionAccepted && (
                    <div style={{ marginTop: '30px', padding: '18px', background: '#f8f1e9', borderRadius: '12px', textAlign: 'center', color: '#4a1028', fontWeight: 800, fontSize: '16px', border: '1px solid #dfcdd1' }}>
                      تم تحقيق الأثر الغذائي والاجتماعي بنجاح في هذا الطلب! ✓
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="team-section section" id="team">
        <div className="shell">
          <div className="section-heading split-heading"><div><p className="eyebrow dark"><span /> فريق رفد</p><h2>تقنية، تشغيل،<br />وأثر في فريق واحد.</h2></div><p>تخصصات متكاملة تجمع بناء المنتج والذكاء الاصطناعي والأمن والاستدامة والبحث الاجتماعي.</p></div>
          <div className="team-grid">
            {team.map((member) => <article key={member.name}><div className="avatar">{member.initials}</div><span>{member.role}</span><h3>{member.name}</h3><p>{member.bio}</p></article>)}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="shell cta-card"><div><p>جاهزون لتجربة محدودة وقابلة للقياس</p><h2>لننقذ أول فائض<br />قبل نهاية الخدمة.</h2></div><a className="button button-gold" href="#demo">ابدأ تجربة Pilot</a></div>
      </section>

      <footer><div className="shell footer-inner"><Brand light /><p>بيانات تتحول إلى وجبات لا تُهدر.</p><span>© 2026 رفد</span></div></footer>
    </main>
  );
}
