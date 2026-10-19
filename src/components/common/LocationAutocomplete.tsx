import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchLocations, LocationItem } from '../../data/locations';

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChangeValue: (text: string) => void;
  placeholder?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  onChangeValue,
  placeholder = 'ஊர் அல்லது நகரத்தின் பெயரை உள்ளிடவும்...',
}) => {
  const [query, setQuery] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<LocationItem[]>([]);

  const handleTextChange = (text: string) => {
    setQuery(text);
    onChangeValue(text);
    if (text.trim().length > 0) {
      const matches = searchLocations(text);
      setResults(matches);
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (item: LocationItem) => {
    const chosen = `${item.tamil} (${item.english})`;
    setQuery(chosen);
    onChangeValue(chosen);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery('');
    onChangeValue('');
    setShowDropdown(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={18}
          color="#991B1B"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onFocus={() => {
            if (query.trim().length > 0) {
              setResults(searchLocations(query));
              setShowDropdown(true);
            }
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <MaterialCommunityIcons name="close-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete Dropdown List */}
      {showDropdown && results.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={styles.scrollList}
          >
            {results.map((item, index) => (
              <TouchableOpacity
                key={`${item.tamil}_${index}`}
                onPress={() => handleSelect(item)}
                style={styles.dropdownItem}
              >
                <MaterialCommunityIcons
                  name="city-variant-outline"
                  size={15}
                  color="#6B7280"
                />
                <Text style={styles.itemTamil}>{item.tamil}</Text>
                <Text style={styles.itemEnglish}>({item.english})</Text>
                {item.district && (
                  <Text style={styles.itemDistrict}>{item.district}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
  },
  clearBtn: {
    padding: 4,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  scrollList: {
    maxHeight: 180,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
    gap: 6,
  },
  itemTamil: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  itemEnglish: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemDistrict: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 'auto',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
