const AVATAR_SVG = `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="bg" cx="50%" cy="45%" r="55%">
    <stop offset="0%" stop-color="#1e3a68"/>
    <stop offset="100%" stop-color="#081428"/>
  </radialGradient>
  <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fce0c0"/>
    <stop offset="100%" stop-color="#f0a878"/>
  </linearGradient>
  <linearGradient id="coat" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f8fcff"/>
    <stop offset="100%" stop-color="#deeeff"/>
  </linearGradient>
  <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3d2010"/>
    <stop offset="100%" stop-color="#180a04"/>
  </linearGradient>
</defs>
<!-- BG -->
<circle cx="130" cy="130" r="130" fill="url(#bg)"/>
<!-- COAT BODY -->
<path d="M10 260 Q8 195 55 178 L82 168 L130 184 L178 168 L205 178 Q252 195 250 260Z" fill="url(#coat)"/>
<!-- COLLAR -->
<path d="M100 168 L95 185 L130 178 L165 185 L160 168 L130 176Z" fill="#e0eef8" stroke="#cce0f0" stroke-width="1"/>
<!-- NECK -->
<rect x="116" y="160" width="28" height="30" rx="14" fill="url(#skin)"/>
<!-- HEAD -->
<ellipse cx="130" cy="105" rx="54" ry="63" fill="url(#skin)"/>
<!-- HAIR BACK LAYER -->
<ellipse cx="130" cy="88" rx="57" ry="67" fill="url(#hair)"/>
<!-- HAIR SIDES -->
<path d="M76 108 Q70 140 75 168 Q80 188 88 200 L82 200 Q70 184 66 162 Q60 138 64 108Z" fill="url(#hair)"/>
<path d="M184 108 Q190 140 185 168 Q180 188 172 200 L178 200 Q190 184 194 162 Q200 138 196 108Z" fill="url(#hair)"/>
<!-- HAIR FRONT -->
<path d="M78 85 Q76 45 130 36 Q184 45 182 85 L182 74 Q180 32 130 24 Q80 32 78 74Z" fill="url(#hair)"/>
<!-- EARS -->
<ellipse cx="76" cy="110" rx="9" ry="12" fill="url(#skin)"/>
<ellipse cx="184" cy="110" rx="9" ry="12" fill="url(#skin)"/>
<ellipse cx="76" cy="110" rx="5.5" ry="8" fill="#e89870"/>
<!-- EYEBROWS -->
<path d="M107 82 Q118 76 124 80" stroke="#3d2010" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M153 82 Q142 76 136 80" stroke="#3d2010" stroke-width="3" fill="none" stroke-linecap="round"/>
<!-- EYES WHITE -->
<ellipse cx="116" cy="98" rx="10.5" ry="11" fill="white"/>
<ellipse cx="144" cy="98" rx="10.5" ry="11" fill="white"/>
<!-- IRIS -->
<circle cx="116" cy="99" r="7.5" fill="#5c3a28"/>
<circle cx="144" cy="99" r="7.5" fill="#5c3a28"/>
<!-- PUPIL -->
<circle cx="116" cy="99" r="4" fill="#1a0a04"/>
<circle cx="144" cy="99" r="4" fill="#1a0a04"/>
<!-- SHINE -->
<circle cx="112" cy="95" r="2.2" fill="white" opacity=".9"/>
<circle cx="140" cy="95" r="2.2" fill="white" opacity=".9"/>
<!-- LASHES -->
<path d="M106 90 Q116 86 126 90" stroke="#3d2010" stroke-width="1.8" fill="none"/>
<path d="M134 90 Q144 86 154 90" stroke="#3d2010" stroke-width="1.8" fill="none"/>
<!-- NOSE -->
<path d="M126 113 Q124 122 127 124 Q130 126 133 124 Q136 122 134 113" stroke="#c8845a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<!-- SMILE + TEETH -->
<path d="M112 136 Q130 150 148 136" stroke="#b8543a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<path d="M115 136 Q130 145 145 136 L143 141 Q130 150 117 141Z" fill="white"/>
<!-- CHEEKS -->
<ellipse cx="96" cy="122" rx="13" ry="9" fill="#f9a0b4" opacity=".38"/>
<ellipse cx="164" cy="122" rx="13" ry="9" fill="#f9a0b4" opacity=".38"/>
<!-- STETHOSCOPE -->
<path d="M113 170 Q104 188 100 210 Q96 230 105 237 Q114 244 120 234" stroke="#6366f1" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="120" cy="234" r="10" fill="#6366f1"/>
<circle cx="120" cy="234" r="5" fill="#a5b4fc"/>
<!-- BADGE -->
<rect x="140" y="184" width="26" height="18" rx="4" fill="#10b981"/>
<text x="153" y="197" text-anchor="middle" font-size="11" fill="white" font-family="sans-serif">🌿</text>
</svg>`;
