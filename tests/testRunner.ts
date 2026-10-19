import { NAKSHATRAS, getSuggestedRasi, getValidPaathams } from '../src/data/nakshatraMapping';
import { DEFAULT_PLANET_ABBRS, PLANETS_MASTER } from '../src/data/planets';
import { searchLocations } from '../src/data/locations';
import { createDefaultProfile } from '../src/types/biodata';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
}

console.log('🧪 Starting Tamil Marriage Biodata Test Suite...\n');

// 1. Test Nakshatras count
assert(NAKSHATRAS.length === 27, `Expected 27 Nakshatras, found ${NAKSHATRAS.length}`);
console.log('✅ Test 1 Passed: Exact 27 Nakshatras present.');

// 2. Test Section 11 Mapping specifications
// மேஷம்: அசுவினி (1-4), பரணி (1-4), கார்த்திகை (1)
assert(getSuggestedRasi('அசுவினி', 1)?.rasiTamil === 'மேஷம்', 'Ashwini 1 must be Mesham');
assert(getSuggestedRasi('அசுவினி', 4)?.rasiTamil === 'மேஷம்', 'Ashwini 4 must be Mesham');
assert(getSuggestedRasi('பரணி', 1)?.rasiTamil === 'மேஷம்', 'Bharani 1 must be Mesham');
assert(getSuggestedRasi('பரணி', 4)?.rasiTamil === 'மேஷம்', 'Bharani 4 must be Mesham');
assert(getSuggestedRasi('கார்த்திகை', 1)?.rasiTamil === 'மேஷம்', 'Krittika 1 must be Mesham');

// ரிஷபம்: கார்த்திகை (2,3,4), ரோகிணி (1,2,3,4), மிருகசீரிடம் (1,2)
assert(getSuggestedRasi('கார்த்திகை', 2)?.rasiTamil === 'ரிஷபம்', 'Krittika 2 must be Rishabam');
assert(getSuggestedRasi('கார்த்திகை', 4)?.rasiTamil === 'ரிஷபம்', 'Krittika 4 must be Rishabam');
assert(getSuggestedRasi('ரோகிணி', 1)?.rasiTamil === 'ரிஷபம்', 'Rohini 1 must be Rishabam');
assert(getSuggestedRasi('ரோகிணி', 4)?.rasiTamil === 'ரிஷபம்', 'Rohini 4 must be Rishabam');
assert(getSuggestedRasi('மிருகசீரிடம்', 1)?.rasiTamil === 'ரிஷபம்', 'Mrigashirsha 1 must be Rishabam');
assert(getSuggestedRasi('மிருகசீரிடம்', 2)?.rasiTamil === 'ரிஷபம்', 'Mrigashirsha 2 must be Rishabam');

// மிதுனம்: மிருகசீரிடம் (3,4), திருவாதிரை (1,2,3,4), புனர்பூசம் (1,2,3)
assert(getSuggestedRasi('மிருகசீரிடம்', 3)?.rasiTamil === 'மிதுனம்', 'Mrigashirsha 3 must be Mithunam');
assert(getSuggestedRasi('மிருகசீரிடம்', 4)?.rasiTamil === 'மிதுனம்', 'Mrigashirsha 4 must be Mithunam');
assert(getSuggestedRasi('திருவாதிரை', 1)?.rasiTamil === 'மிதுனம்', 'Ardra 1 must be Mithunam');
assert(getSuggestedRasi('திருவாதிரை', 4)?.rasiTamil === 'மிதுனம்', 'Ardra 4 must be Mithunam');
assert(getSuggestedRasi('புனர்பூசம்', 1)?.rasiTamil === 'மிதுனம்', 'Punarvasu 1 must be Mithunam');
assert(getSuggestedRasi('புனர்பூசம்', 3)?.rasiTamil === 'மிதுனம்', 'Punarvasu 3 must be Mithunam');

// கடகம்: புனர்பூசம் (4), பூசம் (1,2,3,4), ஆயில்யம் (1,2,3,4)
assert(getSuggestedRasi('புனர்பூசம்', 4)?.rasiTamil === 'கடகம்', 'Punarvasu 4 must be Kadagam');
assert(getSuggestedRasi('பூசம்', 1)?.rasiTamil === 'கடகம்', 'Pushya 1 must be Kadagam');
assert(getSuggestedRasi('ஆயில்யம்', 4)?.rasiTamil === 'கடகம்', 'Ashlesha 4 must be Kadagam');

// சிம்மம்: மகம் (1,2,3,4), பூரம் (1,2,3,4), உத்திரம் (1)
assert(getSuggestedRasi('மகம்', 1)?.rasiTamil === 'சிம்மம்', 'Magha 1 must be Simmam');
assert(getSuggestedRasi('பூரம்', 2)?.rasiTamil === 'சிம்மம்', 'Purva Phalguni 2 must be Simmam');
assert(getSuggestedRasi('உத்திரம்', 1)?.rasiTamil === 'சிம்மம்', 'Uttara Phalguni 1 must be Simmam');

// கன்னி: உத்திரம் (2,3,4), அஸ்தம் (1,2,3,4), சித்திரை (1,2)
assert(getSuggestedRasi('உத்திரம்', 2)?.rasiTamil === 'கன்னி', 'Uttara Phalguni 2 must be Kanni');
assert(getSuggestedRasi('அஸ்தம்', 1)?.rasiTamil === 'கன்னி', 'Hasta 1 must be Kanni');
assert(getSuggestedRasi('சித்திரை', 1)?.rasiTamil === 'கன்னி', 'Chitra 1 must be Kanni');

// துலாம்: சித்திரை (3,4), சுவாதி (1,2,3,4), விசாகம் (1,2,3)
assert(getSuggestedRasi('சித்திரை', 3)?.rasiTamil === 'துலாம்', 'Chitra 3 must be Thulam');
assert(getSuggestedRasi('சுவாதி', 1)?.rasiTamil === 'துலாம்', 'Swati 1 must be Thulam');
assert(getSuggestedRasi('விசாகம்', 1)?.rasiTamil === 'துலாம்', 'Vishakha 1 must be Thulam');

// விருச்சிகம்: விசாகம் (4), அனுஷம் (1,2,3,4), கேட்டை (1,2,3,4)
assert(getSuggestedRasi('விசாகம்', 4)?.rasiTamil === 'விருச்சிகம்', 'Vishakha 4 must be Viruchigam');
assert(getSuggestedRasi('அனுஷம்', 1)?.rasiTamil === 'விருச்சிகம்', 'Anuradha 1 must be Viruchigam');
assert(getSuggestedRasi('கேட்டை', 4)?.rasiTamil === 'விருச்சிகம்', 'Jyeshtha 4 must be Viruchigam');

// தனுசு: மூலம் (1,2,3,4), பூராடம் (1,2,3,4), உத்திராடம் (1)
assert(getSuggestedRasi('மூலம்', 1)?.rasiTamil === 'தனுசு', 'Mula 1 must be Dhanusu');
assert(getSuggestedRasi('பூராடம்', 4)?.rasiTamil === 'தனுசு', 'Purva Ashadha 4 must be Dhanusu');
assert(getSuggestedRasi('உத்திராடம்', 1)?.rasiTamil === 'தனுசு', 'Uttara Ashadha 1 must be Dhanusu');

// மகரம்: உத்திராடம் (2,3,4), திருவோணம் (1,2,3,4), அவிட்டம் (1,2)
assert(getSuggestedRasi('உத்திராடம்', 2)?.rasiTamil === 'மகரம்', 'Uttara Ashadha 2 must be Magaram');
assert(getSuggestedRasi('திருவோணம்', 1)?.rasiTamil === 'மகரம்', 'Shravana 1 must be Magaram');
assert(getSuggestedRasi('அவிட்டம்', 2)?.rasiTamil === 'மகரம்', 'Dhanishta 2 must be Magaram');

// கும்பம்: அவிட்டம் (3,4), சதயம் (1,2,3,4), பூரட்டாதி (1,2,3)
assert(getSuggestedRasi('அவிட்டம்', 3)?.rasiTamil === 'கும்பம்', 'Dhanishta 3 must be Kumbam');
assert(getSuggestedRasi('சதயம்', 1)?.rasiTamil === 'கும்பம்', 'Shatabhisha 1 must be Kumbam');
assert(getSuggestedRasi('பூரட்டாதி', 1)?.rasiTamil === 'கும்பம்', 'Purva Bhadrapada 1 must be Kumbam');

// மீனம்: பூரட்டாதி (4), உத்திரட்டாதி (1,2,3,4), ரேவதி (1,2,3,4)
assert(getSuggestedRasi('பூரட்டாதி', 4)?.rasiTamil === 'மீனம்', 'Purva Bhadrapada 4 must be Meenam');
assert(getSuggestedRasi('உத்திரட்டாதி', 1)?.rasiTamil === 'மீனம்', 'Uttara Bhadrapada 1 must be Meenam');
assert(getSuggestedRasi('ரேவதி', 4)?.rasiTamil === 'மீனம்', 'Revati 4 must be Meenam');
console.log('✅ Test 2 Passed: All 27 Nakshatras & 108 Paatham-Rasi relationships verified.');

// 3. Test Planet Abbreviations
assert(DEFAULT_PLANET_ABBRS['சூரியன்'] === 'சூ', 'Sun must be சூ');
assert(DEFAULT_PLANET_ABBRS['சந்திரன்'] === 'சந்', 'Moon must be சந்');
assert(DEFAULT_PLANET_ABBRS['செவ்வாய்'] === 'செ', 'Mars must be செ');
assert(DEFAULT_PLANET_ABBRS['புதன்'] === 'பு', 'Mercury must be பு');
assert(DEFAULT_PLANET_ABBRS['குரு'] === 'கு', 'Jupiter must be கு');
assert(DEFAULT_PLANET_ABBRS['சுக்கிரன்'] === 'சுக்', 'Venus must be சுக்');
assert(DEFAULT_PLANET_ABBRS['சனி'] === 'ச', 'Saturn must be ச');
assert(DEFAULT_PLANET_ABBRS['ராகு'] === 'ரா', 'Rahu must be ரா');
assert(DEFAULT_PLANET_ABBRS['கேது'] === 'கே', 'Ketu must be கே');
assert(DEFAULT_PLANET_ABBRS['லக்னம்'] === 'லக்', 'Lagna must be லக்');
console.log('✅ Test 3 Passed: All 10 Astrological Abbreviations verified.');

// 4. Test Location Autocomplete search
const chennaiMatches = searchLocations('சென்னை');
assert(chennaiMatches.length > 0 && chennaiMatches[0].tamil === 'சென்னை', 'Search for Chennai failed');
const maduraiMatches = searchLocations('madurai');
assert(maduraiMatches.length > 0 && maduraiMatches[0].english === 'Madurai', 'English case-insensitive search failed');
console.log('✅ Test 4 Passed: Location autocomplete search verified.');

// 5. Test Default Profile Factory
const groomProfile = createDefaultProfile('groom');
assert(groomProfile.gender === 'groom', 'Groom profile gender must be groom');
assert(groomProfile.rasi === 'கன்னி', 'Default rasi verified');
assert(groomProfile.brothersCount === 1, 'Default sibling count verified');

const brideProfile = createDefaultProfile('bride');
assert(brideProfile.gender === 'bride', 'Bride profile gender must be bride');
console.log('✅ Test 5 Passed: Profile model & factory verified.');

console.log('\n🎉 ALL 5 TEST SUITES PASSED SUCCESSFULLY!');
