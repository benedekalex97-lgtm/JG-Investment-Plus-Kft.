/**
 * TARTALMI SOURCE OF TRUTH — Adatkezelési tájékoztató (adatfeldolgozói)
 * ----------------------------------------------------------------------
 * Forrás: "Adatkezelési tájékoztató - adatfeldolgozói.docx"
 *
 * Az alábbi szövegek a dokumentumból szó szerint, változtatás nélkül
 * származnak. Kizárólag webes tagolás (szakaszok, listák) történt; a jogi
 * tartalom, a jogalapok, az érintetti jogok, a kapcsolattartási adatok és a
 * jogorvoslati információk szó szerint megegyeznek a forrásdokumentummal.
 *
 * Az egyetlen nem szó szerinti beavatkozás: a dokumentum "A helyesbítéshez
 * való jog" bekezdése a forrásban két, mondat közepén megtört <w:p>
 * bekezdésre esett szét ("...teljesíti a személyes adatok" / "pontosítását.").
 * Ez a webes megjelenítésben egyetlen mondattá lett összefűzve (nem
 * változtatva a szöveg tartalmán), hogy a weboldalon ne jelenjen meg egy
 * mondat közepén törésként.
 *
 * MÓDOSÍTÁSI SZABÁLY: a jogi tartalom módosítása kizárólag a forrás DOCX
 * frissítése és jóváhagyása után, ennek a fájlnak a cseréjével történhet.
 *
 * v1.0 KIEGÉSZÍTÉS — WEBOLDAL TECHNIKAI KISZOLGÁLÁSA (`hosting` mező, lent).
 * Ez a szakasz NEM a DOCX-ből származik: a fentiek szerinti szabály csak a
 * DOCX-eredetű jogi törzsszövegre vonatkozik (definitions / legalBases /
 * rights / remedy / closing), azt a `hosting` mező hozzáadása nem érinti és
 * nem módosítja. A `hosting` mező a weboldal saját, technikai kiegészítése:
 * a production hosting szolgáltatás (Vercel Inc.) által a weboldal
 * kiszolgálása során kezelhető technikai adatok bizonyított, hivatalos
 * forrásból (Vercel Privacy Notice) alátámasztott felsorolása. Nem állít
 * GDPR-szerepet (adatfeldolgozó/al-adatfeldolgozó), nem határoz meg
 * megőrzési időt és nem tesz adattovábbítási garanciát — csak a bizonyított
 * technikai tényt közli.
 */

export type PrivacyLegalBasisItem = {
  readonly heading: string;
  readonly body: string;
};

export type PrivacyRightItem = {
  readonly heading: string;
  readonly body: readonly string[];
  readonly list?: readonly string[];
};

export const privacyPolicy = {
  title: "Adatkezelési tájékoztató",
  intro: "Tájékoztatjuk, hogy a JG Investment Plus Kft. (Székhely: 2336 Dunavarsány, Nagyvarsányi utca 133. Cégjegyzékszám: 13-09-236124 a továbbiakban: „JG Investment Plusz” vagy „Adatfeldolgozó”) a Patria Finance Magyarországi Fióktelepe (Székhely: 1095 Budapest, Lechner Ödön fasor 9. cégjegyzékszám: 01 17 001469 a továbbiakban: K&H Értékpapír vagy Adatkezelő) nevében, mint Adatfeldolgozó személyes adatokat kezel. A JG Investment Plus Kft. elkötelezett a személyes adatok védelme és azok bizalmas kezelése mellett. Az Adatfeldolgozóval kapcsolatban álló természetes személyek, mint Érintettek adatait jelen adatkezelési tájékoztatóban foglalt eltérés hiányában a K&H Értékpapír adatkezelési tájékoztatójában foglaltaknak megfelelően kezeljük.",

  definitions: {
    heading: "Fogalmak",
    items: [
    "érintett: az az azonosított vagy azonosítható a természetes személy, akire a személyes adat vonatkozik",
    "személyes adat: azonosított vagy azonosítható természetes személyre („Ügyfél”) vonatkozó bármely információ; azonosítható az a természetes személy, aki közvetlen vagy közvetett módon, különösen valamely azonosító, például név, szám, helymeghatározó adat, online azonosító vagy a természetes személy testi, fiziológiai, genetikai, szellemi, gazdasági, kulturális vagy szociális azonosságára vonatkozó egy vagy több tényező alapján azonosítható;",
    "adatkezelés: a személyes adatokon vagy adatállományokon automatizált vagy nem automatizált módon végzett bármely művelet vagy műveletek összessége, így a gyűjtés, rögzítés, rendszerezés, tagolás, tárolás, átalakítás vagy megváltoztatás, lekérdezés, betekintés, felhasználás, közlés továbbítás, terjesztés vagy egyéb módon történő hozzáférhetővé tétel útján, összehangolás vagy összekapcsolás, korlátozás, törlés, illetve megsemmisítés;",
    "adatkezelő: az a természetes vagy jogi személy, közhatalmi szerv, ügynökség vagy bármely egyéb szerv, amely a személyes adatok kezelésének céljait és eszközeit önállóan vagy másokkal együtt meghatározza; ha az adatkezelés céljait és eszközeit az uniós vagy a tagállami jog határozza meg, az adatkezelőt vagy az adatkezelő kijelölésére vonatkozó különös szempontokat az uniós vagy a tagállami jog is;",
    "adatfeldolgozó: az a természetes vagy jogi személy, közhatalmi szerv, ügynökség vagy bármely egyéb szerv, amely az Adatkezelő nevében személyes adatokat kezel;",
    "címzett: az a természetes vagy jogi személy, közhatalmi szerv, ügynökség vagy bármely egyéb szerv, akivel vagy amellyel a személyes adatot közlik, függetlenül attól, hogy harmadik fél-e. Azon közhatalmi szervek, amelyek egy egyedi vizsgálat keretében az uniós vagy a tagállami joggal összhangban férhetnek hozzá személyes adatokhoz, nem minősülnek címzettnek; az említett adatok e közhatalmi szervek általi kezelése meg kell, hogy feleljen az adatkezelés céljainak megfelelően az alkalmazandó adatvédelmi szabályoknak.",
  ],
  },

  legalBases: {
    heading: "Jogalapok",
    intro: "Az adatkezelés jogszerűségét a következő jogalapok valamelyikének meglétével biztosítja az Adatkezelő.",
    items: [
    { heading: "Az Érintett hozzájárulása", body: "A hozzájárulás minden esetben egyértelmű, önkéntes, konkrét és megfelelő tájékoztatáson alapuló és egyértelmű kinyilvánítása, amellyel az érintett nyilatkozat vagy a megerősítést félreérthetetlenül kifejező cselekedet útján jelzi, hogy beleegyezését adja az őt érintő személyes adatok kezeléséhez. A hozzájárulást az Adatkezelő részére célonként külön lehet megadni. A hozzájárulás elmaradása nem jár jogkövetkezménnyel. Az Adatkezelő töröli az Érintettre vonatkozó személyes adatokat, ha az Érintett visszavonja a hozzájárulását, és az adatkezelésnek nincs más célja, melyhez más jogalap kapcsolódhat. A hozzájárulás visszavonására bármikor, egyéb adatkezeléstől függetlenül is lehetőség van. Amennyiben a hozzájárulás megszerzése elektronikus úton történik (pl.: jelölőnégyzetre kattintással) az Érintettnek az Adatkezelő lehetőséget biztosít, hogy ugyanezen módon és egyszerűséggel visszavonhassa hozzájárulását. Amennyiben az Érintett pl. alkalmazásban járult hozzá az adatkezeléshez, az Adatkezelő biztosítja a hozzájárulás ugyanazon az elektronikus felületen való visszavonásának lehetőségét. A hozzájárulás visszavonása nem érinti a visszavonás előtti adatkezelés jogszerűségét." },
    { heading: "Szerződés teljesítése", body: "Az adatkezelés olyan szerződés teljesítéséhez szükséges, amelyben az érintett az egyik fél, vagy az a szerződés megkötését megelőzően az érintett kérésére történő lépések megtételéhez szükséges. A szerződés megkötése és az adatkezelés között objektív közvetlen kapcsolatnak kell fennállnia, tehát az adatkezelésnek a szerződés megkötéséhez vagy teljesítéséhez mindenképpen szükségesnek kell lennie. A szerződés megkötésének előkészítése jogalapon kezelt adatok esetén az adatkezelés időtartama megegyezik azzal az időtartammal, ameddig a szerződés létrejöttének meghiúsulásával kapcsolatban igény érvényesíthető. Ez az időtartam – amennyiben jogszabály vagy az Európai Unió kötelező jogi aktusa másként nem rendelkezik – öt év, amely határidő elévülési jellegű." },
    { heading: "Jogi kötelezettség teljesítése", body: "Az Adatkezelő által végzett adatkezelés jogalapjául jellemzően az Európai Unió közösségi aktusai (Rendelet), tagállami (az Adatkezelő esetén a magyar) ágazati jogszabályok szolgálnak. Ilyen például a befektetési vállalkozásokról és az árutőzsdei szolgáltatókról, valamint az általuk végezhető tevékenységek szabályairól szóló 2007. évi CXXXVIII. törvény vagy a pénzmosás és a terrorizmus finanszírozása megelőzéséről és megakadályozásáról szóló 2017. évi LIII. törvény." },
    { heading: "Jogos érdek", body: "Az Adatkezelő vagy egy harmadik fél oldalán fennálló, az adatkezelés jogszerűségét megalapozó, jogszerű, érdekmérlegelésre alkalmas módon kifejezett, valóságos és létező érdek. Ilyen esetek például azon adatkezelések, melyekre jogszabály csupán lehetőséget biztosít, de nem teszi explicit kötelezővé az adatkezelést. A jogos érdek jogalapon kezelt adatkezelés ellen az Érintett bármikor tiltakozhat, kivéve, hogy az adatkezelést olyan kényszerítő erejű jogos okok indokolják, amelyek elsőbbséget élveznek az érintett érdekeivel, jogaival és szabadságaival szemben, vagy amelyek jogi igények előterjesztéséhez, érvényesítéséhez vagy védelméhez kapcsolódnak." }
    ] as const satisfies readonly PrivacyLegalBasisItem[],
  },

  rights: {
    heading: "Érintettek jogai",
    intro: "Az érintetti jog egy lehetőség az érintetteknek, hogy a rájuk vonatkozó adatkezelések esetén az adatkezelés részleteit megismerhessék. Az Érintettek az érintetti jogok gyakorlásával kapcsolatos megkereséseket az alábbi módok egyikén nyújthatják be az Adatfeldolgozó részére:",
    contactMethods: [
    "írásban az alábbiak szerint:",
    "elektronikus levélben az jginvestmentpluskft@gmail.com e-mail címen",
    "postai úton az Adatfeldolgozó székhelyére küldött levélben: 2336 Dunavarsány, Nagyvarsányi utca 133.",
    "telefonon a 36 30 485 0895 telefonszámon.",
  ],
    afterContact: [
    "Az adatkezelő részére is benyújtható az érintetti joggyakorlás az Adatkezelő adatkezelési tájékoztatójában foglaltaknak megfelelően. Az Érintetti jogok megválaszolását, kezelését, kivizsgálását az Adatkezelő végzi függetlenül attól, hogy a megkeresés címzettje az Adatkezelő vagy az Adatfeldolgozó.",
    "Az Érintettnek joga van arra, hogy az Adatkezelő által tárolt személyes adatait és a kezelésükkel kapcsolatos információkat megismerhesse, bármikor kikérje, ellenőrizze, hogy az Adatkezelő milyen adatot tart nyilván róla, továbbá jogosult arra, hogy a személyes adatokhoz hozzáférést kapjon. Az érintetti jogi igényét indokolatlan késedelem nélkül, a kérelem benyújtásától számított legrövidebb időn belül, de legfeljebb egy hónapon belül tájékoztatja az Adatkezelő a kérelmével összefüggésben meghozott intézkedéseinkről a kérelemben megjelölt csatornán, ennek hiányában a kérelem beérkezésének módján. Érintetti igény elutasítása az Érintett beazonosításának lehetősége hiányában elutasítható, kivéve, ha az Érintett további adatokat bocsájt az Adatkezelő/Adatfeldolgozó rendelkezésére azonosítás céljából. Az érintetti jogi igény ügyintézése ingyenes. Abban az esetben azonban, ha a kérelem egyértelműen megalapozatlan vagy túlzó (például ismétlődő jellege miatt), az Adatkezelő észszerű összegű díjat számíthat fel vagy megtagadhatja az intézkedést.",
  ],
    items: [
      {
        heading: "Tájékoztatáshoz való jog",
        body: [
            "Az Adatkezelő tömören, átláthatóan, érthetően, világosan, közérthetően fogalmazva tájékoztatja az Érintetteket az őket megillető jogokról.",
          ],
      },
      {
        heading: "A hozzáféréshez való jog",
        body: [
            "Az Adatkezelő az Érintett hozzáférési joga gyakorlása esetén – amennyiben kezel személyes adatot az Érintettről, az Érintett kérésének megfelelően tájékoztatja annak körülményiről.",
          ],
      },
      {
        heading: "A helyesbítéshez való jog",
        body: [
            "Az Adatkezelő az Érintett kérésére indokolatlan késedelem nélkül teljesíti a személyes adatok pontosítását.",
          ],
      },
      {
        heading: "Az elfeledtetéshez (törléshez) való jog",
        body: [
            "Törléshez való jog gyakorlása esetén az Érintett kéri az Adatkezelőt, hogy a rá vonatkozó adatokat törölje. A törlés megvalósításához az alábbi feltételek valamelyikének kell teljesülnie:",
          ],
        list: [
            "a személyes adatokra már nincs szükség abból a célból, amelyből azokat gyűjtötték vagy más módon kezelték;",
            "Az Adatkezelő az Érintett hozzájárulása alapján kezelte az adatait és az Érintett úgy dönt, ezt a hozzájárulást visszavonja;",
            "Az Érintett eredményesen tiltakozott az adat kezelése ellen",
            "a személyes adatát jogellenesen kezelték",
            "a személyes adatát az adatkezelőre alkalmazandó uniós vagy tagállami jogban előírt jogi kötelezettség teljesítéséhez törölni kell",
            "Az Érintett úgy dönt, hogy nem kívánja tovább, hogy az adatkezelő valamely, az információs társadalommal összefüggő szolgáltatása nyújtása során kezelje a személyes adatát.",
          ],
      },
      {
        heading: "Az adatkezelés korlátozásához való jog",
        body: [
            "Adatkezelés korlátozás esetén az adaton semmilyen adatkezelési művelet nem hajtható végre. Az adatkezelés korlátozását az alábbi esetekben kérheti az Érintett:",
          ],
        list: [
            "Az Érintett vitatja a személyes adatok pontosságát, aminek következtében az Adatkezelő az adatok pontosságának ellenőrzése időtartamára korlátozza az adatkezelést;",
            "az Érintett álláspontja szerint az adatkezelés jogellenes, de kifejezetten ellenzi, hogy az Adatkezelő törölje az adatot, ehelyett arra kéri, hogy tárolja;",
            "bár az adatkezelőnek már nincs szüksége a személyes adatokra az adatkezelés céljából, de az Érintett igényli azokat, hogy valamilyen jogi igényt terjeszthessen elő, érvényesíthessen vagy védhessen;",
            "tiltakozási jog gyakorlása esetén arra az időtartamra, ameddig az Adatkezelő megvizsgálja tiltakozását",
          ],
      },
      {
        heading: "A tiltakozáshoz való jog",
        body: [
            "Amennyiben egy adatkezelést az Adatkezelő saját vagy harmadik fél jogos érdeke alapján végzi, az Érintett jogosult arra, hogy tiltakozzon az adatkezelés ellen. Az Adatkezelő minden ilyen adatkezelés megkezdése előtt érdekmérlegelési tesztet végez el és ilyen jogalapon csak akkor végez adatkezelést, ha megbizonyosodott róla, hogy a saját vagy harmadik fél jogos érdeke elsőbbséget élvez az érintettek érdekeivel szemben. Tiltakozás esetén a jogos érdekek és okok ütközését elvégezzük. A tiltakozás megvizsgálása során személyes adatainak kezelését korlátozzuk és amennyiben a vizsgálat eredményeként az adatkezelést olyan kényszerítő erejű jogos okok indokolják, amelyek elsőbbséget élveznek az Érintett érdekeivel, jogaival és szabadságaival szemben, az adatkezelést tovább folytatja. Amennyiben a mérlegelés eredménye értelmében az Érintett érdekei élveznek elsőbbséget, az adatait töröljük.",
          ],
      },
      {
        heading: "Az adathordozhatósághoz való jog",
        body: [
            "Amennyiben az adatkezelés jogalapja az Érintett hozzájárulása vagy az Adatkezelő és az Érintett között fennálló szerződés és az adatkezelés automatizált módon történik, úgy az Érintett jogosult arra, hogy kérelmére a rá vonatkozó, az általa rendelkezésünkre bocsátott személyes adatokat tagolt, széles körben használt, géppel olvasható formátumban megkapja, valamint arra is, hogy kérje személyes adatainak – ha ez technikailag megvalósítható – egy másik adatkezelőnek történő közvetlen továbbítását.",
          ],
      }
    ] as readonly PrivacyRightItem[],
  },

  remedy: {
    heading: "Jogorvoslat",
    body: [
    "Amennyiben eredménytelenül letelt az egy hónapos határidő vagy a kérelmére megtett intézkedésünket nem fogadja el, a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (cím: 1055 Budapest, Falk Miksa utca 9-11.; levelezési cím: 1363 Budapest, Pf.: 9.; telefon: +36-1-391-1400; fax: +36-1-391-1410; e-mail: ugyfelszolgalat@naih.hu; honlap: https://naih.hu/; a továbbiakban: NAIH) fordulhat és panaszt tehet vagy bírósághoz (www.birosag.hu) fordulhat. A Nemzeti Adatvédelmi és Információszabadság Hatóság illetékessége az egész ország területére kiterjed, eljáró bíróság az Ön lakó- vagy tartózkodási helye szerint illetékes törvényszék. A törvényszékek felsorolását és elérhetőségét az alábbi linken keresztül lehet megtekinteni: http://birosag.hu/torvenyszekek).",
  ],
  },

  closing: {
    heading: "Záró rendelkezés",
    body: [
    "Részletes adatkezelési tájékoztatás, ahol többek között az adatkezelés célja(i), jogalapja, őrzési ideje, az adatvédelmi tisztviselő elérhetősége, stb. is megismerhető, az Adatkezelő Adatkezelési tájékoztatójában megtalálható.",
  ],
  },

  /**
   * WEBOLDAL TECHNIKAI KISZOLGÁLÁSA — v1.0 kiegészítés, NEM DOCX-forrás.
   * Ld. a fájl fejlécének megjegyzését. A production hosting platform a
   * Vercel lesz; ez a szakasz kizárólag a bizonyított technikai tényt
   * közli, GDPR-szerep (adatfeldolgozó stb.), megőrzési idő vagy
   * adattovábbítási garancia megjelölése nélkül.
   */
  hosting: {
    heading: "Weboldal technikai kiszolgálása",
    intro:
      "A weboldal technikai tárhely- és kiszolgálási infrastruktúráját a Vercel Inc. biztosítja.",
    provider: {
      name: "Vercel Inc.",
      addressLines: [
        "440 N Barranca Ave #4133",
        "Covina, CA 91723",
        "United States",
      ],
    },
    dataIntro:
      "A weboldal meglátogatása során a szolgáltatás működtetéséhez szükséges technikai adatok kerülhetnek kezelésre, így különösen:",
    dataItems: [
      "IP-cím",
      "IP-cím alapján meghatározott hozzávetőleges helyadat",
      "böngésző- és eszközinformációk",
      "rendszerkonfigurációs adatok",
      "kérési és naplóadatok",
      "a szolgáltatás működésével és teljesítményével kapcsolatos technikai adatok",
    ],
    notUsedIntro: "A JG Investment Plus Kft. weboldala jelenleg nem használ:",
    notUsedItems: [
      "webes adatbekérő űrlapot",
      "analitikai szolgáltatást",
      "marketing trackinget",
      "marketing cookie-t",
    ],
    noticeText:
      "A Vercel saját adatkezelésére vonatkozó részletes és mindenkor hatályos tájékoztatás a Vercel Privacy Notice oldalán érhető el.",
    noticeLinkLabel: "Vercel Privacy Notice",
    noticeUrl: "https://vercel.com/legal/privacy-notice",
    /**
     * A weboldal-specifikus technikai kiegészítés (ez a `hosting` szakasz)
     * közzétételi dátuma — NEM azonos a lenti `effectiveDate`-tel, ami a
     * DOCX-eredetű jogi törzsszöveg hatályossági dátuma. A kettő szándékosan
     * különálló: az `effectiveDate` sorát ez a mező nem módosítja.
     */
    publishedDate: "Weboldal-specifikus technikai kiegészítés közzététele: 2026. szeptember 17.",
  },

  effectiveDate: "hatályos: 2026. március 1-től",
} as const;
