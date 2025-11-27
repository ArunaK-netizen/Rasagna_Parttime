import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSales } from '../../context/SalesContext';
import { useProducts } from '../../context/ProductContext';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import * as Haptics from 'expo-haptics';

export default function Dashboard() {
    const { transactions } = useSales();
    const { products, categories } = useProducts();
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'snacks');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { colorScheme, toggleColorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const today = format(new Date(), 'yyyy-MM-dd');
    const todaysTransactions = transactions.filter(t => t.date === today);

    const totalCash = todaysTransactions
        .filter(t => t.paymentMethod === 'cash')
        .reduce((sum, t) => sum + (t.price * t.quantity), 0);

    const totalCard = todaysTransactions
        .filter(t => t.paymentMethod === 'card' || t.paymentMethod === 'upi')
        .reduce((sum, t) => sum + (t.price * t.quantity), 0);

    const totalTips = todaysTransactions.reduce((sum, t) => sum + (t.tip || 0), 0);
    const totalSales = totalCash + totalCard;

    const handleCategoryPress = (cat: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCategory(cat);
        setSearchQuery('');
        Keyboard.dismiss();
    };

    const handleProductPress = (item: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: '/modal',
            params: {
                productName: item.name,
                category: selectedCategory,
                price: item.price.toString()
            }
        });
    };

    // Filter products based on search query
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) {
            return products[selectedCategory] || [];
        }
        const query = searchQuery.toLowerCase();
        // Search across all categories if searching, or just current? 
        // Let's search current category for now to keep UI simple, or all if preferred.
        // User asked for "add new product", but for search let's keep it simple.
        // Actually, searching across all might be better UX.
        // For now, let's stick to current category to match previous behavior, 
        // or we can search all. Let's search all if query exists.
        return Object.values(products).flat().filter(p =>
            p.name.toLowerCase().includes(query)
        );
    }, [searchQuery, selectedCategory, products]);

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={isDark ? ['#1c1c1e', '#2c2c2e'] : ['#f2f2f7', '#e5e5ea']}
                style={styles.headerGradient}
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
                            {format(new Date(), 'EEEE, MMMM do')}
                        </Text>
                        <Text style={[styles.titleText, isDark && styles.titleTextDark]}>Daily Sales</Text>
                    </View>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/add-product' as any);
                            }}
                            style={[styles.iconButton, isDark && styles.iconButtonDark]}
                        >
                            <Text style={styles.iconButtonText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                toggleColorScheme();
                            }}
                            style={[styles.iconButton, isDark && styles.iconButtonDark]}
                        >
                            <Text style={styles.themeEmoji}>{isDark ? '☀️' : '🌙'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statsCard, isDark && styles.statsCardDark]}>
                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Total</Text>
                                <Text style={[styles.statValue, isDark && styles.statValueDark, styles.statValueLarge]}>
                                    ${totalSales.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statRow}>
                            <View style={[styles.statItem, styles.statItemCompact]}>
                                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Cash</Text>
                                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                                    ${totalCash.toFixed(2)}
                                </Text>
                            </View>
                            <View style={[styles.statItem, styles.statItemCompact]}>
                                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Card</Text>
                                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                                    ${totalCard.toFixed(2)}
                                </Text>
                            </View>
                            <View style={[styles.statItem, styles.statItemCompact]}>
                                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Tips</Text>
                                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                                    ${totalTips.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
                        <Text style={[styles.searchIcon, isDark && styles.searchIconDark]}>🔍</Text>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search products..."
                            placeholderTextColor={isDark ? '#8e8e93' : '#c7c7cc'}
                            style={[styles.searchInput, isDark && styles.searchInputDark]}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                                <Text style={styles.clearButtonText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.categoriesSection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesScroll}
                    >
                        {categories.map(cat => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => handleCategoryPress(cat)}
                                    style={[
                                        styles.categoryChip,
                                        isSelected && styles.categoryChipSelected,
                                        isDark && !isSelected && styles.categoryChipDark,
                                        isDark && isSelected && styles.categoryChipSelectedDark
                                    ]}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        isSelected && styles.categoryTextSelected,
                                        isDark && !isSelected && styles.categoryTextDark
                                    ]}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Products Grid */}
                <FlatList
                    data={filteredProducts}
                    numColumns={2}
                    keyExtractor={item => item.id || item.name}
                    contentContainerStyle={[styles.productsGrid, { paddingBottom: 120 }]}
                    columnWrapperStyle={styles.productRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.productCard, isDark && styles.productCardDark]}
                            onPress={() => handleProductPress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.productContent}>
                                <Text style={[styles.productName, isDark && styles.productNameDark]}>
                                    {item.name}
                                </Text>
                                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f7',
    },
    containerDark: {
        backgroundColor: '#000000',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 280,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    dateText: {
        fontSize: 13,
        color: '#8e8e93',
        fontFamily: 'Outfit_400Regular',
        fontWeight: '500',
        letterSpacing: -0.1,
    },
    dateTextDark: {
        color: '#98989d',
    },
    titleText: {
        fontSize: 34,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
        marginTop: 2,
        letterSpacing: -0.5,
        fontWeight: '700',
    },
    titleTextDark: {
        color: '#ffffff',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    iconButtonDark: {
        backgroundColor: 'rgba(58, 58, 60, 0.95)',
    },
    iconButtonText: {
        fontSize: 24,
        fontFamily: 'Outfit_600SemiBold',
        color: '#007AFF',
        marginTop: -2,
    },
    themeEmoji: {
        fontSize: 20,
    },
    statsContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    statsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    statsCardDark: {
        backgroundColor: '#1c1c1e',
        shadowColor: '#000',
        shadowOpacity: 0.3,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
    },
    statItemCompact: {
        flex: 1,
    },
    statLabel: {
        fontSize: 13,
        color: '#8e8e93',
        fontFamily: 'Outfit_600SemiBold',
        marginBottom: 4,
        letterSpacing: -0.1,
    },
    statLabelDark: {
        color: '#98989d',
    },
    statValue: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        color: '#007AFF',
        letterSpacing: -0.3,
    },
    statValueDark: {
        color: '#0A84FF',
    },
    statValueLarge: {
        fontSize: 36,
        marginBottom: 8,
    },
    statDivider: {
        height: 1,
        backgroundColor: '#e5e5ea',
        marginVertical: 16,
    },
    categoriesSection: {
        marginBottom: 16,
    },
    categoriesScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryChipDark: {
        backgroundColor: '#1c1c1e',
    },
    categoryChipSelected: {
        backgroundColor: '#007AFF',
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    categoryChipSelectedDark: {
        backgroundColor: '#0A84FF',
    },
    categoryText: {
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        letterSpacing: -0.2,
    },
    categoryTextDark: {
        color: '#ffffff',
    },
    categoryTextSelected: {
        color: '#ffffff',
    },
    productsGrid: {
        paddingHorizontal: 12,
        paddingBottom: 24,
    },
    productRow: {
        justifyContent: 'space-between',
    },
    productCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        margin: 8,
        padding: 16,
        minHeight: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        justifyContent: 'space-between',
    },
    productCardDark: {
        backgroundColor: '#1c1c1e',
        shadowOpacity: 0.3,
    },
    productContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 17,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    productNameDark: {
        color: '#ffffff',
    },
    productPrice: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        color: '#007AFF',
        letterSpacing: -0.3,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    searchBarDark: {
        backgroundColor: '#1c1c1e',
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 8,
        opacity: 0.5,
    },
    searchIconDark: {
        opacity: 0.6,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#000000',
        padding: 0,
    },
    searchInputDark: {
        color: '#ffffff',
    },
    clearButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e5e5ea',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    clearButtonText: {
        fontSize: 14,
        color: '#8e8e93',
        fontWeight: '600',
    },
});
