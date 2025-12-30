import { endOfMonth, format, isSameMonth, parseISO, startOfMonth, subDays } from 'date-fns';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSales } from '../../context/SalesContext';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
    const { transactions } = useSales();
    const { colorScheme } = useTheme();
    const router = useRouter();
    const isDark = colorScheme === 'dark';
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Generate last 7 days data for chart
    const weekData = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const daySales = transactions
            .filter(t => t.date === dateStr)
            .reduce((sum, t) => {
                if (t.items) {
                    return sum + t.items.reduce((s, i) => s + (i.price * i.quantity), 0);
                }
                return sum + ((t.price || 0) * (t.quantity || 0));
            }, 0);

        return {
            value: daySales,
            label: format(date, 'EEE')[0],
            labelTextStyle: {
                color: isDark ? '#98989d' : '#8e8e93',
                fontFamily: 'Outfit_600SemiBold',
                fontSize: 11,
            },
            frontColor: '#007AFF',
        };
    });

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, t) => {
        if (t.items) {
            return sum + t.items.reduce((s, i) => s + (i.price * i.quantity), 0);
        }
        return sum + ((t.price || 0) * (t.quantity || 0));
    }, 0);
    const totalTips = transactions.reduce((sum, t) => sum + (t.tip || 0), 0);
    const totalTransactions = transactions.length;

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRevenue = transactions
        .filter(t => t.date === today)
        .reduce((sum, t) => {
            if (t.items) {
                return sum + t.items.reduce((s, i) => s + (i.price * i.quantity), 0);
            }
            return sum + ((t.price || 0) * (t.quantity || 0));
        }, 0);

    // Selected Date Stats
    const selectedDateTransactions = transactions.filter(t => t.date === selectedDate);
    const selectedDateRevenue = selectedDateTransactions.reduce((sum, t) => {
        if (t.items) {
            return sum + t.items.reduce((s, i) => s + (i.price * i.quantity), 0);
        }
        return sum + ((t.price || 0) * (t.quantity || 0));
    }, 0);
    const selectedDateTips = selectedDateTransactions.reduce((sum, t) => sum + (t.tip || 0), 0);

    // Mark days with transactions for calendar
    const markedDates = transactions.reduce((acc, t) => {
        acc[t.date] = { marked: true, dotColor: '#007AFF' };
        return acc;
    }, {} as any);

    if (selectedDate) {
        markedDates[selectedDate] = {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: '#007AFF',
            selectedTextColor: '#ffffff',
        };
    }



    const generateDayReport = async () => {
        try {
            const html = `
                <html>
                    <head>
                        <style>
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
                            h1 { text-align: center; color: #333; }
                            .summary { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                            th { background-color: #f2f2f7; color: #333; }
                            .total-row { font-weight: bold; background-color: #f9f9f9; }
                        </style>
                    </head>
                    <body>
                        <h1>Daily Sales Report</h1>
                        <p style="text-align: center; color: #666;">${format(parseISO(selectedDate), 'EEEE, MMMM do, yyyy')}</p>
                        
                        <div class="summary">
                            <p><strong>Total Revenue:</strong> $${selectedDateRevenue.toFixed(2)}</p>
                            <p><strong>Total Tips:</strong> $${selectedDateTips.toFixed(2)}</p>
                            <p><strong>Transactions:</strong> ${selectedDateTransactions.length}</p>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Payment</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${selectedDateTransactions.map(t => {
                if (t.items && t.items.length > 0) {
                    const total = t.items.reduce((s, i) => s + (i.price * i.quantity), 0);
                    const itemsList = t.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ');
                    return `
                                            <tr>
                                                <td>${format(new Date(t.timestamp), 'HH:mm')}</td>
                                                <td>${itemsList}</td>
                                                <td>${t.items.length} items</td>
                                                <td>${t.paymentMethod.toUpperCase()}</td>
                                                <td>$${total.toFixed(2)}</td>
                                            </tr>
                                        `;
                }
                return `
                                        <tr>
                                            <td>${format(new Date(t.timestamp), 'HH:mm')}</td>
                                            <td>${t.productName}</td>
                                            <td>${t.quantity}</td>
                                            <td>${t.paymentMethod.toUpperCase()}</td>
                                            <td>$${((t.price || 0) * (t.quantity || 0)).toFixed(2)}</td>
                                        </tr>
                                    `;
            }).join('')}
                                <tr class="total-row">
                                    <td colspan="4" style="text-align: right;">Total</td>
                                    <td>$${selectedDateRevenue.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });

            const fileName = `${selectedDate}.pdf`;
            const targetUri = FileSystem.cacheDirectory + fileName;

            try {
                await FileSystem.deleteAsync(targetUri, { idempotent: true });
            } catch (e) {
                // Ignore delete error
            }

            await FileSystem.moveAsync({
                from: uri,
                to: targetUri
            });

            await Sharing.shareAsync(targetUri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF report');
            console.error(error);
        }
    };

    const generateMonthReport = async () => {
        try {
            const date = parseISO(selectedDate);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            const monthName = format(date, 'MMMM yyyy');

            // Group by day
            const dailyStats: Record<string, { revenue: number; tips: number; count: number }> = {};

            transactions.forEach(t => {
                const tDate = parseISO(t.date);
                if (isSameMonth(tDate, date)) {
                    if (!dailyStats[t.date]) {
                        dailyStats[t.date] = { revenue: 0, tips: 0, count: 0 };
                    }
                    if (t.items) {
                        dailyStats[t.date].revenue += t.items.reduce((s, i) => s + (i.price * i.quantity), 0);
                    } else {
                        dailyStats[t.date].revenue += (t.price || 0) * (t.quantity || 0);
                    }
                    dailyStats[t.date].tips += t.tip || 0;
                    dailyStats[t.date].count += 1;
                }
            });

            const sortedDates = Object.keys(dailyStats).sort();
            const totalMonthRevenue = Object.values(dailyStats).reduce((sum, d) => sum + d.revenue, 0);

            const html = `
                <html>
                    <head>
                        <style>
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
                            h1 { text-align: center; color: #333; }
                            .summary { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                            th { background-color: #f2f2f7; color: #333; }
                            .total-row { font-weight: bold; background-color: #f9f9f9; }
                        </style>
                    </head>
                    <body>
                        <h1>Monthly Sales Report</h1>
                        <p style="text-align: center; color: #666;">${monthName}</p>
                        
                        <div class="summary">
                            <p><strong>Total Revenue:</strong> $${totalMonthRevenue.toFixed(2)}</p>
                            <p><strong>Active Days:</strong> ${sortedDates.length}</p>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transactions</th>
                                    <th>Tips</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedDates.map(dateStr => `
                                    <tr>
                                        <td>${format(parseISO(dateStr), 'MMM dd')}</td>
                                        <td>${dailyStats[dateStr].count}</td>
                                        <td>$${dailyStats[dateStr].tips.toFixed(2)}</td>
                                        <td>$${dailyStats[dateStr].revenue.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                                <tr class="total-row">
                                    <td colspan="3" style="text-align: right;">Total Revenue</td>
                                    <td>$${totalMonthRevenue.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });

            const fileName = `${format(date, 'MMMM-yyyy')}.pdf`;
            const targetUri = FileSystem.cacheDirectory + fileName;

            try {
                await FileSystem.deleteAsync(targetUri, { idempotent: true });
            } catch (e) {
                // Ignore delete error
            }

            await FileSystem.moveAsync({
                from: uri,
                to: targetUri
            });

            await Sharing.shareAsync(targetUri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF report');
            console.error(error);
        }
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[styles.title, isDark && styles.titleDark]}>Reports</Text>

                    {/* Calendar Selection */}
                    <View style={[styles.calendarCard, isDark && styles.calendarCardDark]}>

                        <Calendar
                            key={colorScheme}
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: isDark ? '#98989d' : '#8e8e93',
                                selectedDayBackgroundColor: '#007AFF',
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: '#007AFF',
                                dayTextColor: isDark ? '#ffffff' : '#000000',
                                textDisabledColor: isDark ? '#48484a' : '#c7c7cc',
                                dotColor: '#007AFF',
                                selectedDotColor: '#ffffff',
                                arrowColor: '#007AFF',
                                monthTextColor: isDark ? '#ffffff' : '#000000',
                                indicatorColor: '#007AFF',
                                textDayFontFamily: 'Outfit_400Regular',
                                textMonthFontFamily: 'Outfit_700Bold',
                                textDayHeaderFontFamily: 'Outfit_600SemiBold',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 13,
                            }}
                            markedDates={markedDates}
                            style={styles.calendar}
                            onDayPress={(day: { dateString: string }) => {
                                setSelectedDate(day.dateString);
                            }}
                        />
                    </View>

                    {/* Selected Date Actions */}
                    <View style={styles.actionsContainer}>
                        <Text style={[styles.selectedDateText, isDark && styles.selectedDateTextDark]}>
                            {format(parseISO(selectedDate), 'MMMM do, yyyy')}
                        </Text>

                        {/* Selected Date Stats */}
                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, isDark && styles.statCardDark]}>
                                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Revenue</Text>
                                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                                    ${selectedDateRevenue.toFixed(2)}
                                </Text>
                            </View>
                            <View style={[styles.statCard, isDark && styles.statCardDark]}>
                                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Tips</Text>
                                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                                    ${selectedDateTips.toFixed(2)}
                                </Text>
                            </View>
                            <View style={[styles.statCard, isDark && styles.statCardDark]}>
                                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Count</Text>
                                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                                    {selectedDateTransactions.length}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.primaryButton]}
                                onPress={generateDayReport}
                            >
                                <Text style={styles.primaryButtonText}>Download Day Report</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.secondaryButton, isDark && styles.secondaryButtonDark]}
                                onPress={generateMonthReport}
                            >
                                <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>
                                    Month Report
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    {/* Weekly Chart */}
                    <View style={[styles.chartCard, isDark && styles.chartCardDark]}>
                        <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Last 7 Days</Text>
                        <View style={styles.chartContainer}>
                            <BarChart
                                key={totalRevenue} // Force re-render when data changes
                                data={weekData}
                                barWidth={26}
                                noOfSections={4}
                                barBorderRadius={4}
                                frontColor="#007AFF"
                                yAxisThickness={0}
                                xAxisThickness={0}
                                yAxisTextStyle={{
                                    color: isDark ? '#98989d' : '#8e8e93',
                                    fontFamily: 'Outfit_400Regular',
                                    fontSize: 11,
                                }}
                                hideRules
                                width={width - 80}
                                height={180}
                                isAnimated
                                animationDuration={800}
                                spacing={20}
                                backgroundColor="transparent"
                            />
                        </View>
                    </View>
                </ScrollView>
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
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    title: {
        fontSize: 34,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
        marginBottom: 20,
        letterSpacing: -0.5,
        fontWeight: '700',
    },
    titleDark: {
        color: '#ffffff',
    },
    summaryCard: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    summaryCardDark: {
        backgroundColor: '#0A84FF',
    },
    cardTitle: {
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 8,
        letterSpacing: -0.2,
    },
    cardTitleDark: {
        color: '#ffffff',
    },
    summaryValue: {
        fontSize: 42,
        fontFamily: 'Outfit_700Bold',
        color: '#ffffff',
        marginBottom: 4,
        letterSpacing: -1,
    },
    summaryValueDark: {
        color: '#ffffff',
    },
    summaryLabel: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: -0.1,
    },
    summaryLabelDark: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    calendarCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    calendarCardDark: {
        backgroundColor: '#1c1c1e',
        shadowOpacity: 0.3,
    },
    calendar: {
        backgroundColor: 'transparent',
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionTitleDark: {
        color: '#ffffff',
    },
    actionsContainer: {
        marginBottom: 24,
    },
    selectedDateText: {
        fontSize: 17,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 12,
        textAlign: 'center',
    },
    selectedDateTextDark: {
        color: '#ffffff',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
    },
    secondaryButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e5ea',
    },
    secondaryButtonDark: {
        backgroundColor: '#1c1c1e',
        borderColor: '#3a3a3c',
    },
    secondaryButtonText: {
        color: '#007AFF',
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
    },
    secondaryButtonTextDark: {
        color: '#0A84FF',
    },
    chartCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    chartCardDark: {
        backgroundColor: '#1c1c1e',
        shadowOpacity: 0.3,
    },
    chartContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        alignItems: 'center',
    },
    statCardDark: {
        backgroundColor: '#1c1c1e',
        shadowOpacity: 0.3,
    },
    statLabel: {
        fontSize: 13,
        fontFamily: 'Outfit_600SemiBold',
        color: '#8e8e93',
        marginBottom: 4,
        letterSpacing: -0.1,
    },
    statLabelDark: {
        color: '#98989d',
    },
    statValue: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
        letterSpacing: -0.5,
    },
    statValueDark: {
        color: '#ffffff',
    },
    transactionsList: {
        marginTop: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    transactionItemDark: {
        backgroundColor: '#1c1c1e',
        shadowOpacity: 0.2,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f2f2f7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerDark: {
        backgroundColor: '#2c2c2e',
    },
    iconText: {
        fontSize: 20,
    },
    productName: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 2,
    },
    productNameDark: {
        color: '#ffffff',
    },
    transactionTime: {
        fontSize: 13,
        color: '#8e8e93',
        fontFamily: 'Outfit_400Regular',
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
        marginBottom: 2,
    },
    transactionAmountDark: {
        color: '#ffffff',
    },
    tipText: {
        fontSize: 12,
        color: '#34C759',
        fontFamily: 'Outfit_500Medium',
    },
    emptyText: {
        textAlign: 'center',
        color: '#8e8e93',
        marginTop: 20,
        fontFamily: 'Outfit_400Regular',
        fontSize: 15,
    },
    emptyTextDark: {
        color: '#98989d',
    },
});
