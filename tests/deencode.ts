import test from 'ava';

import * as MAM from '../lib/mam';

test('Channel::encode and decode', async t => {
    let ctx = await MAM.createContext();

    let sideKey = "ABC".repeat(27);
    let message = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";

    let seed = new MAM.Seed(ctx, "B".repeat(81), 1);
    let idxSeed = new MAM.IndexedSeed(seed, 0);
    let tree = new MAM.MerkleTree(ctx, idxSeed, 8);
    let chan = new MAM.Channel(ctx, MAM.Mode.Public, tree, tree);

    let res = chan.encode(message, sideKey);
    t.true(res instanceof MAM.EncodedMessage);
    let dec = MAM.decodeMessage(ctx, tree.root(), (res as MAM.EncodedMessage).payload, sideKey);

    t.is((dec as MAM.DecodedMessage).payload, message);
    t.is((dec as MAM.DecodedMessage).nextRoot, tree.root());

    tree.discard();
    seed.discard();
});

test('Channel::decode does not crash JS', async t => {
    let ctx = await MAM.createContext();

    let sideKey = "ABC".repeat(27);
    let message = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";

    let seed = new MAM.Seed(ctx, "B".repeat(81), 1);
    let idxSeed = new MAM.IndexedSeed(seed, 0);
    let tree = new MAM.MerkleTree(ctx, idxSeed, 8);
    let chan = new MAM.Channel(ctx, MAM.Mode.Public, tree, tree);

    let res = chan.encode(message, sideKey);
    t.true(res instanceof MAM.EncodedMessage);
    let dec = MAM.decodeMessage(ctx, tree.root(), 'B' + (res as MAM.EncodedMessage).payload, sideKey);

    t.true(!(dec instanceof MAM.DecodedMessage));
    t.is(dec as MAM.Error, MAM.Error.ArrayOutOfBounds);

    tree.discard();
    seed.discard();
});

test('Channel::decode known message works', async t => {
    let msg = 'AQ9DPMETATBBUIFJFDOPCC9XWEOVLJIVNKZAKDTEECWEQKNODCGTKFDMDZODNHZZF9LDJJIDSFYTOYCQQ' +
        'AEVJMGODCVPOYBEXUFWCMBURMTARQHUYN9RQQREDN9HQFRFTJHWHMMSLTQGFKYCIKWGFQXFEAMUQXWZNW' +
        'XVPSAVGCOD99WWWZAGRLGUAUWSJNBTJRTKLHCKJLVQURJM9YQMCNJKI9FENMJLARJYZIPSEOLPGAJ9BTL' +
        'QGAMTBLRREFMLUX9NMMGGA9WMTKRIMIKJZSQNCLV9ZOSDDCUPQLECVFCKTYKOMOKWFTAIHFIRCQSMBO99' +
        'YSVFJVGQTY9WQUMYSEDVMYEGKIUZGGXGCEVGJNJNIBAZSTUAOJPZLYYZGZKWRQULMLCLXHCDNWVEJDZSK' +
        'DRGON9KVIMKRPCAUOGOTWEGYVJLWUZMTVDCTXE9WAIGXOURZATNVYWONMOTNNDUXHZBNNGAXISOVNEEXE' +
        'VXJFW9QYAQXDJO9OHHEMMXWDKJOKR9TLDIHACLYACATUVUWWH9YIYFWXGPZHPMKHBEVPUI9MOF9WVUTWO' +
        'PM9YBJYDE9TJFIDNZYH9ZVNHEVMOSCLHPINSSRWJQTSLDYDHGKPGEGPHOZIEFAVGESGYYTEUZYRWMV9YL' +
        'SWM9IUMXMZNYMPHNDZZODPBKRPTYMIOWARSUUQBHGREJ9XBSBORLTAAJFFPDFRCXQ9VRWMZSKNSLUYA9P' +
        '9BUEDEPLFIOBHRFM9AREIGRGXXPBV9TROUMHDMSRVSKLBCG9F9JJLYHYEPJDQKLWGTBTLFBNVVZLIRNFP' +
        'HEOLEYDUECRDENEMEWVBYPHWDBMNAIYVB99OEEBOBBXPN9HJLLJWPWRUTSPMAPFMIM9LATAVNUINTOKCD' +
        'QUWQGIYNRRGLTWCPTPHPGXYNGOMXKCZZDL9GKIIEZNPIQXZWLOGFOWBWTLZYRETGHOPVAYRIT9OBCPABL' +
        'XTWQYZHTTYFEBNBREZTDCCCKNKZJHTONCKPDRTDVGCZUDWOMZUNGMTLOSX9K9XQYPFINEECCELCZITQNT' +
        'YFSE9SIWSVN9VNRFOZNJDXMLWIHCDTNXFJAXCDKVOBXMWEKJLOPMZEIUYNZFD9QQEVKUTYRIQRMPRHENC' +
        'GMSFMLCEPVVJUCN9SPTTXIURKLWJZJPUOKMRVVJPITBCIRIDPNUGWHXXVWFMKYVDOFJUWEGOCQBMTTWUY' +
        'E9BPMYYTPSACETCAFZEMBPPHVHBXROUISWWOILCAHJNADAQBCHLNZWWHVYYBN9WCMGHEZDYKPFYHCDHNY' +
        'GWUTGPANCGBMVWNLALVYVUXYW9INZLUDWISZLBBQWKBHTJYZQM9DWKOIODBFXNQAHCWYNJKEAVCVTGXOQ' +
        'YFERNGHOL9CJXFQ9BEDG9JNTEYPAUXKU9GJCLLJNISHRYMFGCRCB9UXZWQFW9EXLKFAMGG9AOCBO9XESZ' +
        'OFOJJFJVSTVFBQ9LIEGL9IZTDCDUGOJUWKZMEOVDOMVETDOVQNOXWQDKGVMVRDBZMMPKYTVXVWFCSCIJD' +
        'THBOTMUMRXMWTGWXYJZ9FFBDSVJLYOGKBBND9FBD9EZOHI9XYXSYBGNYDBSYISCAQBXEQWHNWLT9DSAZ9' +
        'SSZOGAOPLNXZWFBZLSSOZX9TIVQBEKTTGZUFHYOBJZTLTGNJWKVPKFGEHNGSTSIVNVJGGX9TRQECMNOPO' +
        'GWG9MOFXIMSL9KENYWEKRYJPVHHXESUAYAITIDSY9H9KHRYSCNTDU9XMYKCGUUPOEYLGMRLFPYUPJMTCH' +
        'CPMBZFZEMRSWZYXYKHARROJHDOQLJKCIPDSQVLNAAJ9JYSLMGEULWVHEHUPUCJDCNFYHJVZTADZC9ZNOG' +
        'UL9WRBVAJMYOTZB9NA9LL9KRGMVICJQPMMFPVCQFAZXAQHSOQDIUTXRUGFJODTCBY99VZITPCRRMTSPDL' +
        'MAYKFIELOHDNYHFMYTBMQWFYXFXM9VUXCIJHHMBMIX9UZSZACZINDVYHVNPCZUQINEQSWNQFJNDJOXYPN' +
        'TLYIMPCBWJLYSOT9OWATXEYWAXVKS9WNXLAXSSRNZAKB9FGJ9EXVEFXHTFDKPWVBDWH9TSIUVNBBIRAUZ' +
        'LSQNXLVJRRBOQZCRVFQNLTFXAPOUGBYQOZOVIGB9LJFROMOWZLYIPAONSHPQTZWPDUKHCJNKHILFQXNKZ' +
        'YDZXZMEDXSLEIASPJEACAZQ9DTTPOJNDTSIFVOEY9JKWGXCCMKUI9SZGFNDMMHIR9LAQZXNTCOQUKWPRW' +
        'IHOMOSMWPVYHAZRSHRUVOBEPRGHWLNEZYGKWSCLCKUKXLMRVYTYZGMTCBXSQGCDWMXKJGCIKWJLXR9KUE' +
        'NOWQTWOPXRSCGEEISGWQSWKXMABRHPERKE9XLUIKSPIKBAPCHPWXKTKTANSUX9HV9RSIHVPJKNEUGPB9S' +
        'GPOXOGE9NU9PUIJLSIGQRRLVTMBZWBASKBGQNORYO9ZDVYQJLIZMYJBDAVMACMSHALDLUOQTAIQFUHYSG' +
        'FMCKNROTNDZVRTIE9BKSWXPNCSZYOYBYBLUFT9HEQK9OQJDIWZOBQZG9ZKEGJYATHKRSQBDNOPQHDELAU' +
        'NSWCYFAPJVKHCIDMPYJEJTPNXZGHTQTB9HTVRYXNHMXUTDVGUISZJOQXMYNWDMIAYCNNGIXHCYXIZQYJW' +
        'ETDZZ9WVRFIGHLTPBB9ARSGEQWG9QVEDXAUYRNR99ANOOJUWZINDOGDLLDD9TYTNZPVYSW9HTOWVVDEJV' +
        'W9VHM9YAXXUBWEEIMGLQE9ENOYVRMMSTCDNOTCRMCINWKMXADKZYHXASKXGSOQQBAHBFHJPZETHUDUBVO' +
        'ZZWJUSHJPMTQDVONOMFOXYXRBURXUVSJZBL99FHAZNKRRTWVNMIJHBQTHICRTZNQBYMOLGJPDZUTLBXCG' +
        'ZTEUVFJGADHTK9LSWPGQFAYKSTIZMWXIHCDKUWEGBJVWTAOHIKKNRHKFEOORAPOYYNXEOQPBREDTUBKDJ' +
        'YFVTMZYKBNJMPVFIVKTTCRVDUOQSCDKC9OYVGFZGFKXHYJGNYNNXRPSECZWYVBCBLRTQ9RPPVU9GLGXOB' +
        'JKVMFG9TOECITBY9KVZOLZUYWVYXVERJPYGAETEWIJKCTHSCRWYRRPAPZWBMCIZNNORSPVXRORLBJOCKD' +
        'KCDTJRPNZPKVYDGGLITMUSRMXNQUNPUXQUKVYVWQHCTUTGZLLSOLSNAYAMQNZPXMTCUPELWIKSKLECCDD' +
        'AOTUYEVRQCKQASZMNUWPUMYDBDSYLJXMWRDBARCOJCQQESHGZDSDY9HXAQVLJLJT9FQWWHDECCMOZXYBK' +
        'VGOGMDJGXZXZIDJFDOGFYCCSGNVONKMSONMHMFYCLQYCBBFHEXGGDDSYXYEQSPQQX9GTNHYOGVRWRWWZN' +
        'HPCNPUEATVYP9BISCQYCIQUTOZXAGTP9GPSNIVOWDOTHCIVAEKFYKSDJJQWJGF9NUJDQAVH9EKHIWOUUF' +
        'ISNJKRIIYDDPEWVPDLSDLRGHENSNOAHCSGRKDTOPEVWECVHKCRGPQAOAMJTIBR9OXEFTOVJMCHSJFEOFR' +
        'WOKCJZCCZNVIVAWNJVOHJQJBTEOHJUCQYDQUAVEEOIREZOG9ZUYNJNDQ9ZZPYYRMLDKDFUWMVYHPPNPRB' +
        'ZTZCHXRFSNNMUXUH9ZUOHSPYDA99JGMXOBEFKKSGZWZXKS9NKSFCB9GKHIYLHFXNYWAYQHPUVKEXRQKSN' +
        'CVDUSDUHQJFBZALPTDZSABBTHSCGNAFGB9CUPOVPKFSKO9GTWPFEPXEWRXEICHQK9NPWRNSYBIZMKEFCX' +
        'NMKHCRBWWCYTWJDL9HPBDOOZKYXPOESAHD9IAUWJDMQUCWKHQA9ANWIZVLJDEKCBDIUGDP9JEQVJRKQCY' +
        'HWVYLMU9GSBS9QFPCPPRVMENVFRMZEIQSE9VEKTIWHDVDUNJNXPQCQ9Y9GTNJPETZLXVHLGAYKFIAVWPL' +
        'BMPCPUNAMICSOFPMNGRFZWKROFHYAGLASBMVNSRQRADEKIFADFYIERJOLJJFCHUVNXCOSW9IUPGWLNVUM' +
        'XWHKLWGUOCHVJBXD9BOFFJRSZUPEACWR9YSXRHRERWMDMRILDXDUUQOUTCIOJVUYQHLIENOU9XMQLPTFX' +
        'W9LEUIHCMQLFP9YWFVIGKBDZT9PCTLKJOCZBQVHZIESTVPECRBTNPFUGDY9KAZOEC9CUZSXBRGBXMCOJS' +
        'ATDPQSM9WXQI9LK9JRBJGEJYDZAUCJIRUEZPTPKWZPEFZRMZHCPSIWPDVHS9QXXRDLDHUCDHUDJQLZDQI' +
        'MRZGPKFWPLAHEGPNFZMVPSJHTHK9ZUHTSDBQPQMSUHPOSQAYNPOAPGCCDIXK9YXXZDNVSYBEZICRMLQOA' +
        'YBHFXAGYUOGFVAJIZRBDUHXVPVYMDEGQNITGEYU9XSCDPBPLTDTNIYPHKECRCNDTBJDZQOAWPPPNAWRDB' +
        'TDCCMOBIH9COKPKOWLVCTECHSRN9TDPNRUDMBSXQDD9IRQBAJA9QELSUECJLYZCTK9QMKYVOS9FO9O9VM' +
        'KCRJNAZABBRMCZQQMDFVQ9PC9RQTW9VOSZ99999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999' +
        '999999999999999999999999999999999999999999999999999999999999999999999999999999999';
    let root = 'NRMESKBKKFUURZQOBNIBTGUOS9QDOBYUANHJNX9KRXMOPRPDVJUSMOPHDCSSDAGOIA9IMPHMUEZTGO9TU';
    let key = 'NBAARIJNCUYQQDHUKZRKEPRERIAMPQBSWKC9XBKUXUBMWGRWDKSJB9MDASXHFMHOFV9QTYWUMXQLEBUKQ';

    let ctx = await MAM.createContext();
    let dec = MAM.decodeMessage(ctx, root, msg, key);
    t.true(dec instanceof MAM.DecodedMessage);
});
