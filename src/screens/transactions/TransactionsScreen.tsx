import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Text as RNText,
  Platform,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../../theme/ThemeProvider';
import { theme } from '../../theme/theme';
import { useWallet } from '../../hooks/useWallet';
import RestrictionBanner from '../../components/RestrictionBanner';
import { useAuthV2 } from '../../hooks/useAuthV2';

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export default function TransactionsScreen() {
  const { palette, mode } = useThemeMode();
  const isDark = mode === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { transactions: apiTransactions, loading, getTransactionHistory } = useWallet();
  const { isRestricted } = useAuthV2();

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch transactions on mount
  useEffect(() => {
    getTransactionHistory();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await getTransactionHistory();
    setRefreshing(false);
  };

  const cardBackground = isDark ? palette.card : '#FFFFFF';
  const featureTint = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.06)';
  const separatorColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.2)';

  // Transform API transactions to match UI format
  const transactions = useMemo(() => {
    if (!apiTransactions || apiTransactions.length === 0) {
      return [];
    }

    return apiTransactions.map((tx) => {
      const isCredit = tx.transaction_type === 'credit';
      // Ensure amount is parsed as a number (API might return as string)
      const numericAmount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      const amount = isCredit ? numericAmount : -numericAmount;

      // Determine icon based on description or type
      let icon = isCredit ? 'arrow-down' : 'arrow-up';
      if (tx.sender_name) icon = 'bank-transfer';
      if (tx.description.toLowerCase().includes('hospital')) icon = 'hospital-building';
      if (tx.description.toLowerCase().includes('baby')) icon = 'baby-carriage';
      if (tx.description.toLowerCase().includes('withdrawal')) icon = 'cash';

      return {
        id: tx.id,
        title: tx.sender_name || (isCredit ? 'Money Received' : 'Withdrawal'),
        description: tx.description,
        amount,
        type: isCredit ? ('income' as const) : ('expense' as const),
        category: 'transaction',
        icon,
        date: new Date(tx.created_at),
        color: isCredit
          ? (isDark ? '#6EE7B7' : '#059669')
          : (isDark ? '#FCA5A5' : '#DC2626'),
      };
    });
  }, [apiTransactions, isDark]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.type === selectedFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.title.toLowerCase().includes(query) ||
          tx.description.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactions, selectedFilter, searchQuery]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof transactions } = {};

    filteredTransactions.forEach((tx) => {
      const dateKey = formatDate(tx.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return Math.abs(
      filteredTransactions
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0)
    );
  }, [filteredTransactions]);

  const bottomContentPadding = useMemo(
    () => insets.bottom + (Platform.OS === 'ios' ? 120 : 108),
    [insets.bottom]
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeading}>
            <RNText style={[styles.headerTitle, { color: palette.text }]}>
              Activity
            </RNText>
            <View style={[styles.headerAccent, { backgroundColor: palette.primary }]} />
          </View>
          <Pressable style={[styles.headerIcon, { backgroundColor: featureTint }]}>
            <MaterialCommunityIcons name="download-outline" size={20} color={palette.text} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: featureTint,
                borderColor: separatorColor,
              },
            ]}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={palette.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search transactions..."
              placeholderTextColor={palette.textSecondary}
              style={[styles.searchInput, { color: palette.text }]}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color={palette.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <Pressable
              style={[
                styles.filterChip,
                selectedFilter === 'all' && [styles.filterChipActive, { backgroundColor: palette.primary }],
                { backgroundColor: selectedFilter === 'all' ? palette.primary : featureTint },
              ]}
              onPress={() => setSelectedFilter('all')}
            >
              <RNText
                style={[
                  styles.filterChipText,
                  { color: selectedFilter === 'all' ? '#FFFFFF' : palette.text },
                ]}
              >
                All
              </RNText>
            </Pressable>
            <Pressable
              style={[
                styles.filterChip,
                selectedFilter === 'income' && [styles.filterChipActive, { backgroundColor: palette.primary }],
                { backgroundColor: selectedFilter === 'income' ? palette.primary : featureTint },
              ]}
              onPress={() => setSelectedFilter('income')}
            >
              <MaterialCommunityIcons
                name="arrow-down-circle"
                size={16}
                color={selectedFilter === 'income' ? '#FFFFFF' : (isDark ? '#6EE7B7' : '#059669')}
              />
              <RNText
                style={[
                  styles.filterChipText,
                  { color: selectedFilter === 'income' ? '#FFFFFF' : palette.text },
                ]}
              >
                Income
              </RNText>
            </Pressable>
            <Pressable
              style={[
                styles.filterChip,
                selectedFilter === 'expense' && [styles.filterChipActive, { backgroundColor: palette.primary }],
                { backgroundColor: selectedFilter === 'expense' ? palette.primary : featureTint },
              ]}
              onPress={() => setSelectedFilter('expense')}
            >
              <MaterialCommunityIcons
                name="arrow-up-circle"
                size={16}
                color={selectedFilter === 'expense' ? '#FFFFFF' : (isDark ? '#FCA5A5' : '#DC2626')}
              />
              <RNText
                style={[
                  styles.filterChipText,
                  { color: selectedFilter === 'expense' ? '#FFFFFF' : palette.text },
                ]}
              >
                Expense
              </RNText>
            </Pressable>
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(5,150,105,0.06)',
                borderColor: isDark ? 'rgba(110,231,183,0.2)' : 'rgba(5,150,105,0.15)',
              },
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-down-circle"
              size={18}
              color={isDark ? '#6EE7B7' : '#059669'}
            />
            <View style={styles.summaryContent}>
              <RNText style={[styles.summaryLabel, { color: palette.textSecondary }]}>
                Income
              </RNText>
              <RNText style={[styles.summaryValue, { color: isDark ? '#6EE7B7' : '#059669' }]}>
                {formatCurrency(totalIncome)}
              </RNText>
            </View>
          </View>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.06)',
                borderColor: isDark ? 'rgba(252,165,165,0.2)' : 'rgba(220,38,38,0.15)',
              },
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={18}
              color={isDark ? '#FCA5A5' : '#DC2626'}
            />
            <View style={styles.summaryContent}>
              <RNText style={[styles.summaryLabel, { color: palette.textSecondary }]}>
                Expense
              </RNText>
              <RNText style={[styles.summaryValue, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>
                {formatCurrency(totalExpense)}
              </RNText>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomContentPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
          }
        >
          {/* Restriction Banner */}
          {isRestricted && <RestrictionBanner style={{ marginBottom: theme.spacing.md }} />}

          {/* Loading State - Only show when initially loading */}
          {loading && !refreshing && transactions.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.primary} />
              <RNText style={[styles.loadingText, { color: palette.textSecondary }]}>
                Loading transactions...
              </RNText>
            </View>
          ) : !loading && transactions.length === 0 ? (
            /* Empty State - No transactions from API */
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="inbox-outline" size={64} color={palette.textSecondary} />
              <RNText style={[styles.emptyTitle, { color: palette.text }]}>No Transactions Yet</RNText>
              <RNText style={[styles.emptySubtitle, { color: palette.textSecondary }]}>
                Your transaction history will appear here
              </RNText>
            </View>
          ) : filteredTransactions.length === 0 ? (
            /* Empty State - Filtered/Search results empty */
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="magnify" size={64} color={palette.textSecondary} />
              <RNText style={[styles.emptyTitle, { color: palette.text }]}>No Matches Found</RNText>
              <RNText style={[styles.emptySubtitle, { color: palette.textSecondary }]}>
                Try adjusting your filters or search query
              </RNText>
            </View>
          ) : (
            /* Transactions List */
            <>
              {Object.entries(groupedTransactions).map(([dateKey, txs]) => (
            <View key={dateKey} style={styles.dateGroup}>
              <RNText style={[styles.dateHeader, { color: palette.textSecondary }]}>
                {dateKey}
              </RNText>
              <View style={styles.transactionsStack}>
                {txs.map((tx) => (
                  <Pressable
                    key={tx.id}
                    style={({ pressed }) => [
                      styles.transactionCard,
                      {
                        backgroundColor: cardBackground,
                        borderColor: separatorColor,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate('TransactionDetails', {
                        transaction: {
                          id: tx.id,
                          title: tx.title,
                          description: tx.description,
                          timestamp: formatDate(tx.date),
                          amount: tx.amount,
                          positive: tx.type === 'income',
                          icon: tx.icon,
                        },
                      });
                    }}
                  >
                    <View style={[styles.transactionIcon, { backgroundColor: tx.color + '1F' }]}>
                      <MaterialCommunityIcons
                        name={tx.icon as any}
                        size={20}
                        color={isDark ? '#F8FAFC' : tx.color}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <RNText style={[styles.transactionTitle, { color: palette.text }]}>
                        {tx.title}
                      </RNText>
                      <RNText style={[styles.transactionDescription, { color: palette.textSecondary }]}>
                        {tx.description}
                      </RNText>
                    </View>
                    <RNText style={[styles.transactionAmount, { color: tx.color }]}>
                      {tx.amount > 0 ? '+' : ''}
                      {formatCurrency(Math.abs(tx.amount))}
                    </RNText>
                  </Pressable>
                ))}
              </View>
            </View>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerLeading: {
    gap: theme.spacing.xs / 1.6,
  },
  headerTitle: {
    fontFamily: 'NeuzeitGro-ExtraBold',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  headerAccent: {
    height: 2,
    width: 34,
    borderRadius: 1,
    marginTop: theme.spacing.xs / 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    paddingVertical: 0,
  },
  filterSection: {
    paddingBottom: theme.spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.xs,
  },
  filterChipActive: {
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filterChipText: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
  },
  summarySection: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  summaryContent: {
    flex: 1,
    gap: theme.spacing.xs / 4,
  },
  summaryLabel: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 11,
  },
  summaryValue: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  dateGroup: {
    gap: theme.spacing.sm,
  },
  dateHeader: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionsStack: {
    gap: theme.spacing.xs,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    gap: theme.spacing.xs / 4,
  },
  transactionTitle: {
    fontFamily: 'NeuzeitGro-SemiBold',
    fontSize: 14,
  },
  transactionDescription: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 12,
  },
  transactionAmount: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  emptyText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 3,
    gap: theme.spacing.md,
  },
  loadingText: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 3,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontFamily: 'NeuzeitGro-Bold',
    fontSize: 18,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    fontFamily: 'NeuzeitGro-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});






