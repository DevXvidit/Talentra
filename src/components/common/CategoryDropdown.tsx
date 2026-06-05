import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ChevronDown, X, Check, Tag } from 'lucide-react-native';
import { jobService } from '../../services/jobService';
import { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface CategoryDropdownProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [displayedCategories, setDisplayedCategories] = useState<string[]>([]);
  const [_loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const categories = await jobService.fetchCategories();
        setAllCategories(categories);
        setDisplayedCategories(categories.slice(0, itemsPerPage));
      } catch (error) {
        console.warn('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLoadMore = () => {
    if (displayedCategories.length >= allCategories.length) return;
    
    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const nextBatch = allCategories.slice(0, endIndex);
      
      setDisplayedCategories(nextBatch);
      setPage(nextPage);
      setLoading(false);
    }, 400); 
  };

  const handleSelect = (category: string) => {
    onSelectCategory(category);
    setModalVisible(false);
  };

  const hasMore = displayedCategories.length < allCategories.length;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.trigger}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.triggerText}>
          {selectedCategory || 'Select Job Category'}
        </Text>
        <ChevronDown size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Tag size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>Select Category</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <X size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={displayedCategories}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === selectedCategory;
                return (
                  <TouchableOpacity
                    style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && <Check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.2}
              ListFooterComponent={() => {
                if (!hasMore) return <View style={{ height: 16 }} />;
                return (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loaderText}>Loading more categories...</Text>
                  </View>
                );
              }}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    width: '100%',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 52,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    fontFamily: 'Inter',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    minHeight: '40%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: 'Space Grotesk',
  },
  closeButton: {
    padding: 6,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 8,
    marginVertical: 2,
  },
  itemRowSelected: {
    backgroundColor: isDark ? colors.surface : '#EEF2FF',
  },
  itemText: {
    fontSize: 14,
    color: colors.foreground,
    fontFamily: 'Inter',
  },
  itemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  loaderContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loaderText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: 'Inter',
  },
});

export default CategoryDropdown;
