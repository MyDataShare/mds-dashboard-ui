import { Estonia, Finland, Latvia, Lithuania, Sweden } from './nin';

describe('Estonian', () => {
  it.each([
    ['47102312300', '(day max)'],
    ['47102012300', '(day min)'],
    ['48412283407', '(month max)'],
    ['48401283407', '(month min)'],
    ['52012198155', '(21st century)'],
  ])('%s should be valid %s', (v) => {
    expect(Estonia.validate(v)).toBe(true);
  });

  it.each([
    ['47102312300', '(day max)'],
    ['47102012300', '(day min)'],
    ['48412283407', '(month max)'],
    ['48401283407', '(month min)'],
    ['52012198155', '(21st century)'],
  ])('%s pattern should be valid %s', (v) => {
    expect(Estonia.isPatternValid(v)).toBe(true);
  });

  it.each([
    ['47102322300', '(day over)'],
    ['47102002300', '(day under)'],
    ['48413283407', '(month over)'],
    ['48400283407', '(month under)'],
    ['2012198155', '(No century)'],
    ['02012198155', '(0 century)'],
    ['72012198155', '(7 century)'],
    ['7201219815A', '(checksum not a digit)'],
  ])('%s should be invalid %s', (v) => {
    expect(Estonia.validate(v)).toBe(false);
  });

  it.each([
    ['47102322300', '(day over)'],
    ['47102002300', '(day under)'],
    ['48413283407', '(month over)'],
    ['48400283407', '(month under)'],
    ['2012198155', '(No century)'],
    ['02012198155', '(0 century)'],
    ['72012198155', '(7 century)'],
    ['7201219815A', '(checksum not a digit)'],
  ])('%s pattern should be invalid %s', (v) => {
    expect(Estonia.isPatternValid(v)).toBe(false);
  });
});

describe('Finnish', () => {
  it.each([
    ['310394-9134', '(day max)'],
    ['010394-9532', '(day min)'],
    ['151294-953B', '(month max)'],
    ['150194-9457', '(month min)'],
    ['040499+789T', '(19th century)'],
    ['300723A3485', '(21st century)'],
    ['240902-3374', '(control digit)'],
    ['131052-308T', '(control character)'],
    ['240777-712Y', '(generated input)'],
    ['280151-398V', '(generated input)'],
    ['211150-6808', '(generated input)'],
    ['220674-161A', '(generated input)'],
    ['260643-187R', '(generated input)'],
    ['261131-8801', '(generated input)'],
    ['060572-497H', '(generated input)'],
    ['300723A3485', '(generated input)'],
    ['211027-626S', '(generated input)'],
    ['110360-605H', '(generated input)'],
    ['291028A013D', '(generated input)'],
    ['030616A514F', '(generated input)'],
    ['170213A020K', '(generated input)'],
    ['021126-0992', '(generated input)'],
    ['220610-246J', '(generated input)'],
    ['081093-640V', '(generated input)'],
    ['151102A549S', '(generated input)'],
    ['230794-181K', '(generated input)'],
    ['290504-251V', '(generated input)'],
    ['261160-0956', '(generated input)'],
    ['300883-393W', '(generated input)'],
    ['190329-423T', '(generated input)'],
    ['170771-0341', '(generated input)'],
    ['221022-510C', '(generated input)'],
    ['100596-1259', '(generated input)'],
    ['010926-897J', '(generated input)'],
    ['190428A496P', '(generated input)'],
    ['060668-579X', '(generated input)'],
    ['180572-480P', '(generated input)'],
    ['140115A865L', '(generated input)'],
    ['300199+034T', '(generated input)'],
    ['200839-6103', '(generated input)'],
    ['290800A007C', '(generated input)'],
    ['180208A3685', '(generated input)'],
    ['280926A8094', '(generated input)'],
    ['190142-048E', '(generated input)'],
    ['070688-631D', '(generated input)'],
    ['080931-571U', '(generated input)'],
    ['100795-101V', '(generated input)'],
    ['161153-5930', '(generated input)'],
    ['290100A005N', '(generated input)'],
    ['180689-2128', '(generated input)'],
    ['050215-764B', '(generated input)'],
    ['190889-6034', '(generated input)'],
    ['190635-5252', '(generated input)'],
    ['010948-252D', '(generated input)'],
    ['140153-370E', '(generated input)'],
    ['130663-008R', '(generated input)'],
    ['100723A0920', '(generated input)'],
    ['030196-5752', '(generated input)'],
    ['090106A083U', '(generated input)'],
    ['191035-836A', '(generated input)'],
    ['280400-4250', '(generated input)'],
    ['120326A766K', '(generated input)'],
    ['260425-654J', '(generated input)'],
    ['091024-856N', '(generated input)'],
    ['200500A0728', '(generated input)'],
    ['080128-606R', '(generated input)'],
    ['270342-565W', '(generated input)'],
    ['120124-6955', '(generated input)'],
    ['100656-175C', '(generated input)'],
    ['200245-2783', '(generated input)'],
    ['151012A156V', '(generated input)'],
    ['080645-243E', '(generated input)'],
    ['080777-675E', '(generated input)'],
    ['140235-162W', '(generated input)'],
    ['110119A639D', '(generated input)'],
    ['120114A077M', '(generated input)'],
  ])('%s should be valid %s', (v) => {
    expect(Finland.validate(v)).toBe(true);
  });

  it.each([
    ['310394-9134', '(day max)'],
    ['010394-9532', '(day min)'],
    ['151294-953B', '(month max)'],
    ['150194-9457', '(month min)'],
    ['040499+789T', '(19th century)'],
    ['300723A3485', '(21st century)'],
    ['240902-3374', '(control digit)'],
    ['131052-308T', '(control character)'],
    ['240777-712Y', '(generated input)'],
    ['300723A348A', '(control invalid)'],
  ])('%s pattern should be valid %s', (v) => {
    expect(Finland.isPatternValid(v)).toBe(true);
  });

  it.each([
    ['320394-9134', '(day over)'],
    ['000394-9532', '(day under)'],
    ['151394-953B', '(month over)'],
    ['150094-9457', '(month under)'],
    ['300723A348A', '(control invalid)'],
  ])('%s should be invalid %s', (v) => {
    expect(Finland.validate(v)).toBe(false);
  });

  it.each([
    ['320394-9134', '(day over)'],
    ['000394-9532', '(day under)'],
    ['151394-953B', '(month over)'],
    ['150094-9457', '(month under)'],
  ])('%s pattern should be invalid %s', (v) => {
    expect(Finland.isPatternValid(v)).toBe(false);
  });
});

describe('Latvian', () => {
  it.each([
    ['32746539878', '(new format)'],
    ['327465-39878', '(new format, hyphen)'],
    ['121199-00246', '(old format 19th century)'],
    ['121196-10246', '(old format 20th century)'],
    ['121196-20246', '(old format 21st century)'],
    ['12119610246', '(old format, no hyphen)'],
    ['311196-10246', '(old format day max)'],
    ['011196-10246', '(old format day min)'],
    ['121296-10246', '(old format month max)'],
    ['120196-10246', '(old format month min)'],
  ])('%s should be valid %s', (v) => {
    expect(Latvia.validate(v)).toBe(true);
  });

  it.each([
    ['32746539878', '(new format)'],
    ['327465-39878', '(new format, hyphen)'],
    ['121199-00246', '(old format 19th century)'],
    ['121196-10246', '(old format 20th century)'],
    ['121196-20246', '(old format 21st century)'],
    ['12119610246', '(old format, no hyphen)'],
    ['311196-10246', '(old format day max)'],
    ['011196-10246', '(old format day min)'],
    ['121296-10246', '(old format month max)'],
    ['120196-10246', '(old format month min)'],
  ])('%s pattern should be valid %s', (v) => {
    expect(Latvia.isPatternValid(v)).toBe(true);
  });

  it.each([
    ['327465-398787', '(malformed)'],
    ['32746-539878', '(malformed hyphen)'],
    ['331196-10246', '(old format day over)'],
    ['001196-10246', '(old format day under)'],
    ['121396-10246', '(old format month over)'],
    ['120096-10246', '(old format month under)'],
    ['121196-30246', '(old format century over)'],
    ['00119610246', '(old format day under, no hyphen)'],
  ])('%s should be invalid %s', (v) => {
    expect(Latvia.validate(v)).toBe(false);
  });

  it.each([
    ['327465-398787', '(malformed)'],
    ['32746-539878', '(malformed hyphen)'],
    ['331196-10246', '(old format day over)'],
    ['001196-10246', '(old format day under)'],
    ['121396-10246', '(old format month over)'],
    ['120096-10246', '(old format month under)'],
    ['121196-30246', '(old format century over)'],
  ])('%s pattern should be invalid %s', (v) => {
    expect(Latvia.isPatternValid(v)).toBe(false);
  });
});

describe('Lithuanian', () => {
  it.each([
    ['47102312300', '(day max)'],
    ['47102012300', '(day min)'],
    ['48412283407', '(month max)'],
    ['48401283407', '(month min)'],
    ['52012198155', '(21st century)'],
  ])('%s should be valid %s', (v) => {
    expect(Lithuania.validate(v)).toBe(true);
  });

  it.each([
    ['47102312300', '(day max)'],
    ['47102012300', '(day min)'],
    ['48412283407', '(month max)'],
    ['48401283407', '(month min)'],
    ['52012198155', '(21st century)'],
  ])('%s pattern should be valid %s', (v) => {
    expect(Lithuania.isPatternValid(v)).toBe(true);
  });

  it.each([
    ['47102322300', '(day over)'],
    ['47102002300', '(day under)'],
    ['48413283407', '(month over)'],
    ['48400283407', '(month under)'],
    ['2012198155', '(No century)'],
    ['02012198155', '(0 century)'],
    ['72012198155', '(7 century)'],
    ['7201219815A', '(checksum not a digit)'],
  ])('%s should be invalid %s', (v) => {
    expect(Lithuania.validate(v)).toBe(false);
  });

  it.each([
    ['47102322300', '(day over)'],
    ['47102002300', '(day under)'],
    ['48413283407', '(month over)'],
    ['48400283407', '(month under)'],
    ['2012198155', '(No century)'],
    ['02012198155', '(0 century)'],
    ['72012198155', '(7 century)'],
    ['7201219815A', '(checksum not a digit)'],
  ])('%s pattern should be invalid %s', (v) => {
    expect(Lithuania.isPatternValid(v)).toBe(false);
  });
});

describe('Swedish', () => {
  it.each([
    ['19970331-4964', '(day max)'],
    ['970331-4964', '(day max, 10 digits)'],
    ['19971001-4961', '(day min)'],
    ['971001-4961', '(day min, 10 digits)'],
    ['19401218-4968', '(month max)'],
    ['401218-4968', '(month max, 10 digits)'],
    ['19400118-4961', '(month min)'],
    ['20000127-4968', '(month min, 10 digits)'],
    ['18980623+4960', '(19th century)'],
    ['980623+4960', '(19th century, 10 digits)'],
    ['20200527-4960', '(21st century)'],
    ['000127-4968', '(21st century, 10 digits)'],
  ])('%s should be valid %s', (v) => {
    expect(Sweden.validate(v)).toBe(true);
  });

  it.each([
    ['19970331-4964', '(day max)'],
    ['970331-4964', '(day max, 10 digits)'],
    ['19971001-4961', '(day min)'],
    ['971001-4961', '(day min, 10 digits)'],
    ['19401218-4968', '(month max)'],
    ['401218-4968', '(month max, 10 digits)'],
    ['19400118-4961', '(month min)'],
    ['20000127-4968', '(month min, 10 digits)'],
    ['18980623+4960', '(19th century)'],
    ['980623+4960', '(19th century, 10 digits)'],
    ['20200527-4960', '(21st century)'],
    ['000127-4968', '(21st century, 10 digits)'],
    ['18980623+4964', '(checksum invalid)'],
  ])('%s pattern should be valid %s', (v) => {
    expect(Sweden.isPatternValid(v)).toBe(true);
  });

  it.each([
    ['19970332-4964', '(day over)'],
    ['970332-4964', '(day over, 10 digits)'],
    ['19971000-4961', '(day under)'],
    ['971000-4961', '(day under, 10 digits)'],
    ['19401318-4968', '(month over)'],
    ['401318-4968', '(month over, 10 digits)'],
    ['19400018-4961', '(month under)'],
    ['400018-4961', '(month under, 10 digits)'],
    ['202005274960', '(no hyphen)'],
    ['0001274968', '(no hyphen, 10 digits)'],
  ])('%s should be invalid %s', (v) => {
    expect(Sweden.validate(v)).toBe(false);
  });

  it.each([
    ['19970332-4964', '(day over)'],
    ['970332-4964', '(day over, 10 digits)'],
    ['19971000-4961', '(day under)'],
    ['971000-4961', '(day under, 10 digits)'],
    ['19401318-4968', '(month over)'],
    ['401318-4968', '(month over, 10 digits)'],
    ['19400018-4961', '(month under)'],
    ['400018-4961', '(month under, 10 digits)'],
  ])('%s pattern should be invalid %s', (v) => {
    expect(Sweden.isPatternValid(v)).toBe(false);
  });
});
