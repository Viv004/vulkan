import React, { useRef, useState, useEffect } from 'react';
import {
	Animated,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
    Dimensions,
	useWindowDimensions,
	View,
	ActivityIndicator,
	Image
} from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import {
	Activity,
	AlertTriangle,
	ArrowRight,
	CheckCircle2,
	ChevronRight,
	FileText,
	Network,
	ShieldAlert,
	Terminal,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
	ink: '#090909',
	paper: '#FDFBF7',
	orange: '#FF5C00',
	lime: '#CCFF00',
	cyan: '#00F0FF',
	pink: '#FF3366',
	muted: '#6E6A63',
	darkPaper: '#F4F0EA'
};

// Target IDs matching the 20 generated case files
const CASE_IDS = Array.from({ length: 20 }, (_, i) => `HHG-${String(i + 1).padStart(3, '0')}`);

function TactileButton({ children, onPress, color = COLORS.orange, fullWidth = false }) {
	return (
		<Pressable onPress={onPress} style={({ pressed }) => [
			styles.tactileButton, 
			{ backgroundColor: color, width: fullWidth ? '100%' : 'auto' }, 
			pressed && styles.tactileButtonPressed
		]}>
			{children}
		</Pressable>
	);
}

function ProbabilityDial({ probability }) {
	const radius = 60;
	const strokeWidth = 14;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (probability * circumference);
	
	const animValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.spring(animValue, {
			toValue: probability,
			friction: 6,
			tension: 40,
			useNativeDriver: false
		}).start();
	}, [probability]);

	return (
		<View style={styles.dialContainer}>
			<Svg width="160" height="160" viewBox="0 0 160 160">
				<Circle cx="80" cy="80" r={radius} stroke={COLORS.ink} strokeWidth={strokeWidth} fill={COLORS.paper} />
				<Circle 
					cx="80" cy="80" r={radius} 
					stroke={probability > 0.7 ? COLORS.pink : COLORS.lime} 
					strokeWidth={strokeWidth} 
					fill="none" 
					strokeDasharray={circumference} 
					strokeDashoffset={strokeDashoffset} 
					strokeLinecap="square"
					transform="rotate(-90 80 80)"
				/>
			</Svg>
			<View style={styles.dialTextContainer}>
				<Text style={styles.dialPercent}>{(probability * 100).toFixed(0)}%</Text>
				<Text style={styles.dialLabel}>RISK</Text>
			</View>
		</View>
	);
}

function InvestigationViewport({ isDesktop, children }) {
	if (!isDesktop) {
		return <ScrollView style={styles.mobileMainViewport}
            contentContainerStyle={{
                height: Dimensions.get('window').height,
                paddingBottom: 24
            }}
			nestedScrollEnabled
			showsVerticalScrollIndicator={false}>
            {children}
        </ScrollView>;
	}

	return (
		<ScrollView
			style={styles.mainScrollView}
			contentContainerStyle={styles.mainScroll}
			nestedScrollEnabled
			showsVerticalScrollIndicator={false}
		>
			{children}
		</ScrollView>
	);
}

export default function Dashboard() {
	const navigation = useNavigation();
	const { width, height } = useWindowDimensions();
	const [headerHeight, setHeaderHeight] = useState(74);
	
	// Dynamic State
	const [casesList, setCasesList] = useState([]);
	const [activeCase, setActiveCase] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	
	const fadeAnim = useRef(new Animated.Value(1)).current;
	const slideAnim = useRef(new Animated.Value(0)).current;

	// Fetch JSON artifacts on mount
	useEffect(() => {
		const loadCases = async () => {
			try {
				const loadedCases = [];
				for (const id of CASE_IDS) {
					const response = await fetch(`/cases/${id}.json`);
					if (response.ok) {
						const data = await response.json();
						loadedCases.push(data);
					} else {
						console.warn(`Could not load ${id}.json`);
					}
				}
				
				setCasesList(loadedCases);
				if (loadedCases.length > 0) {
					setActiveCase(loadedCases[0]);
				}
			} catch (error) {
				console.error("Error loading cases:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadCases();
	}, []);

	const handleSelectCase = (c) => {
		if (!activeCase || c.case_id === activeCase.case_id) return;
		
		Animated.parallel([
			Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
			Animated.timing(slideAnim, { toValue: 10, duration: 100, useNativeDriver: true })
		]).start(() => {
			setActiveCase(c);
			Animated.parallel([
				Animated.spring(fadeAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
				Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true })
			]).start();
		});
	};

	const isWebDesktop = width > 1024;
	const bodyHeight = Math.max(height - headerHeight, 1);
	const sidebarHeight = isWebDesktop ? bodyHeight : Math.min(250, Math.max(bodyHeight * 0.36, 180));
	// On mobile, mainContent is no longer its own nested scroller (see render below),
	// so it must NOT get a capped height — let it size to its real content and the
	// single outer page ScrollView handles all scrolling.
	const mainHeight = isWebDesktop ? bodyHeight : undefined;
	const dashboardHeight = isWebDesktop ? bodyHeight : undefined;

	if (isLoading) {
		return (
			<View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
				<ActivityIndicator size="large" color={COLORS.orange} />
				<Text style={{ marginTop: 12, fontFamily: 'monospace', color: COLORS.ink, fontWeight: '900' }}>LOADING BENCHMARK ARTIFACTS...</Text>
			</View>
		);
	}

	if (!activeCase) {
		return (
			<View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
				<Text style={{ fontFamily: 'monospace', color: COLORS.pink, fontWeight: 'bold', fontSize: 16 }}>ERROR: NO CASES FOUND</Text>
				<Text style={{ marginTop: 8, color: COLORS.ink, textAlign: 'center' }}>Ensure batch_runner.py generated the JSON files and they are placed in /public/cases/</Text>
			</View>
		);
	}

	const panelsContent = (
		<>
			{/* Investigation Trace (Center) */}
			<View style={[styles.centerPanel, !isWebDesktop && styles.mobileStackPanel]}>
				<View style={styles.cardBrutal}>
					<View style={styles.cardHeader}>
						<Text style={styles.cardEyebrow}>INVESTIGATION TRACE // {activeCase.case.pattern.toUpperCase()}</Text>
					</View>
					
					<View style={styles.traceBlock}>
						<View style={styles.traceIconBox}><Terminal size={18} color={COLORS.paper} /></View>
						<View style={styles.traceContent}>
							<Text style={styles.traceLabel}>AGENT SUMMARY</Text>
							<Text style={styles.traceText}>{activeCase.case.summary}</Text>
						</View>
					</View>

					<View style={styles.traceBlock}>
						<View style={[styles.traceIconBox, { backgroundColor: COLORS.cyan }]}><Network size={18} color={COLORS.ink} /></View>
						<View style={styles.traceContent}>
							<Text style={styles.traceLabel}>GRAPH EVIDENCE GATHERED</Text>
							{activeCase.case.evidence.map((ev, i) => (
								<View key={i} style={styles.bulletRow}>
									<ChevronRight size={16} color={COLORS.ink} />
									<Text style={styles.traceText}>
										<Text style={{fontWeight: '900'}}>[{ev.source.toUpperCase()}] </Text> 
										{ev.claim}
									</Text>
								</View>
							))}
						</View>
					</View>

					{activeCase.sar.file && (
						<View style={[styles.traceBlock, { backgroundColor: COLORS.pink, padding: 16, borderWidth: 3, borderColor: COLORS.ink }]}>
							<View style={[styles.traceIconBox, { backgroundColor: COLORS.ink }]}><FileText size={18} color={COLORS.paper} /></View>
							<View style={styles.traceContent}>
								<Text style={[styles.traceLabel, { color: COLORS.ink }]}>REGULATORY SAR NARRATIVE</Text>
								<Text style={[styles.traceText, { color: COLORS.ink, fontStyle: 'italic', fontWeight: '800' }]}>
									{activeCase.sar.narrative}
								</Text>
							</View>
						</View>
					)}
				</View>
			</View>

			{/* Actions & Verdict (Right) */}
			<View style={[styles.rightPanel, !isWebDesktop && styles.mobileStackPanel]}>
				<View style={[styles.cardBrutal, { alignItems: 'center', backgroundColor: COLORS.cyan }]}>
					<Text style={styles.cardEyebrow}>FINAL VERDICT</Text>
					<ProbabilityDial probability={activeCase.case.fraud_probability} />
					<Text style={styles.verdictText}>{activeCase.case.status.replace('_', ' ').toUpperCase()}</Text>
				</View>

				<View style={styles.cardBrutal}>
					<Text style={styles.cardEyebrow}>NEXT BEST ACTIONS</Text>
					
					<Text style={styles.actionSectionHeader}>INITIAL RECOMMENDATION</Text>
					{activeCase.next_best_actions.initial.map((act, i) => (
						<View key={`init-${i}`} style={styles.actionPill}>
							<Text style={styles.actionText}>{act.action}</Text>
							<View style={styles.routeBadge}><Text style={styles.routeText}>{act.route}</Text></View>
						</View>
					))}

					<Text style={[styles.actionSectionHeader, { marginTop: 16 }]}>FINAL ACTION (POST-EVIDENCE)</Text>
					{activeCase.next_best_actions.final.map((act, i) => (
						<View key={`fin-${i}`} style={[styles.actionPill, { backgroundColor: COLORS.lime }]}>
							<Text style={styles.actionText}>{act.action}</Text>
							<View style={styles.routeBadge}><Text style={styles.routeText}>{act.route}</Text></View>
						</View>
					))}
					
					<View style={styles.transitionBox}>
						<Text style={styles.transitionLabel}>STATE TRANSITION:</Text>
						<Text style={styles.transitionText}>{activeCase.next_best_actions.what_changed}</Text>
					</View>
				</View>
			</View>
		</>
	);

	return (
		<View style={styles.screen}>
			<View style={styles.header} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
				<View style={styles.brandRow}>
					<Image source={require('../assets/logo.png')} style={{ width: 30, height: 30, resizeMode: 'contain' }} />
					<Text style={styles.brand}>VULKAN // DASHBOARD</Text>
				</View>
				<View style={styles.headerRight}>
					<TactileButton color={COLORS.paper} onPress={() => navigation.navigate('Home')}>
						<Text style={styles.buttonText}>BACK TO BLOG</Text>
					</TactileButton>
				</View>
			</View>

			<ScrollView
				style={styles.dashboardViewport}
				contentContainerStyle={isWebDesktop ? undefined : styles.mobileDashboardContent}
				scrollEnabled={!isWebDesktop}
				nestedScrollEnabled
				showsVerticalScrollIndicator={false}
			>
			<View style={[isWebDesktop ? styles.dashboardBody : styles.dashboardBodyMobile, { height: dashboardHeight }, isWebDesktop ? { flexDirection: 'row' } : { flexDirection: 'column' }]}>
				
				{/* LEFT: Case Queue */}
				<View style={[styles.sidebar, { height: sidebarHeight }, isWebDesktop ? { width: 320, borderRightWidth: 3 } : { width: '100%', borderBottomWidth: 3 }]}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>EXAM BENCHMARK ({casesList.length})</Text>
					</View>
					<ScrollView
						style={styles.queueScroll}
						contentContainerStyle={styles.queueContent}
						nestedScrollEnabled
						showsVerticalScrollIndicator={false}
					>
						{casesList.map((item) => {
							const isActive = item.case_id === activeCase.case_id;
							return (
								<Pressable 
									key={item.case_id}
									onPress={() => handleSelectCase(item)}
									style={({ pressed }) => [
										styles.queueItem,
										isActive ? styles.queueItemActive : {},
										pressed && !isActive && { transform: [{ translateX: 2 }, { translateY: 2 }], shadowOpacity: 0 }
									]}
								>
									<View style={styles.queueItemTop}>
										<Text style={[styles.queueId, isActive && { color: COLORS.paper }]}>{item.case_id}</Text>
										<View style={[styles.statusBadge, { backgroundColor: item.case.verdict === 'fraud' ? COLORS.pink : COLORS.lime }]}>
											<Text style={styles.statusBadgeText}>{item.case.verdict.toUpperCase()}</Text>
										</View>
									</View>
									<Text style={[styles.queueTxn, isActive && { color: COLORS.darkPaper }]}>
										Txn: {item.case.first_suspicious_txn_id || 'N/A'} • ${item.case.exposure_usd.toFixed(2)}
									</Text>
								</Pressable>
							);
						})}
					</ScrollView>
				</View>

				{/* CENTER & RIGHT CONTENT */}
				<Animated.View style={[isWebDesktop ? styles.mainContent : styles.mainContentMobile, { height: mainHeight, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
					{isWebDesktop ? (
						// Desktop: independent scrolling column within its own fixed-height viewport
						<ScrollView style={styles.mainScrollView} contentContainerStyle={[styles.mainScroll, { flexDirection: 'row', gap: 24 }]} showsVerticalScrollIndicator={false}>
							{panelsContent}
						</ScrollView>
					) : (
						// Mobile: NOT its own ScrollView, and no flex-grow weighting on the
						// panels — those only work against a definite ancestor height, which
						// doesn't exist here (everything is content-sized on mobile). Just
						// stack them; the single outer page ScrollView above scrolls it all.
						<ScrollView style={styles.mobilePanelStack} contentContainerStyle={{ gap: 24 ,paddingBottom: 24}} showsVerticalScrollIndicator={false}>
							{panelsContent}
						</ScrollView>
					)}
				</Animated.View>
			</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: COLORS.darkPaper , height: Dimensions.get('window').height, width: Dimensions.get('window').width },
	header: { 
		minHeight: 70, paddingHorizontal: 22, backgroundColor: COLORS.orange, 
		borderBottomWidth: 4, borderBottomColor: COLORS.ink, 
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' 
	},
	brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	brandMark: { width: 36, height: 36, borderWidth: 3, borderColor: COLORS.ink, backgroundColor: COLORS.lime, alignItems: 'center', justifyContent: 'center' },
	brand: { fontSize: 24, fontWeight: '900', letterSpacing: -1, color: COLORS.ink },
	headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	
	tactileButton: { 
		paddingHorizontal: 16, paddingVertical: 10, borderWidth: 3, borderColor: COLORS.ink, 
		shadowColor: COLORS.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
		flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
	},
	tactileButtonPressed: { transform: [{ translateX: 4 }, { translateY: 4 }], shadowOpacity: 0, elevation: 0 },
	buttonText: { fontFamily: 'monospace', fontSize: 12, fontWeight: '900', color: COLORS.ink },

	dashboardViewport: { flex: 1, minHeight: 0, minWidth: 0 },
	mobileDashboardContent: { minHeight: Dimensions.get('window').height - 74, minWidth: 0, paddingBottom: 24 },
	mobileMainViewport: { flex: 1,flexDirection: 'column', minWidth: 0, padding: 24 ,paddingBottom: 24, minHeight: 0, minWidth: 0 },
	dashboardBody: { flex: 1, minHeight: 0, minWidth: 0, borderColor: COLORS.ink },
	// Mobile: no flex/minHeight — those only make sense when an ancestor has a
	// definite height to distribute. On mobile everything is content-sized and
	// the page itself scrolls, so this just stacks naturally.
	dashboardBodyMobile: { minWidth: 0, borderColor: COLORS.ink },
	sidebar: { backgroundColor: COLORS.paper, borderColor: COLORS.ink, minHeight: 0, minWidth: 0 },
	sectionHeader: { padding: 16, borderBottomWidth: 3, borderBottomColor: COLORS.ink, backgroundColor: COLORS.cyan },
	sectionTitle: { fontFamily: 'monospace', fontSize: 14, fontWeight: '900' },
	queueScroll: { flex: 1, minHeight: 0, backgroundColor: COLORS.paper },
	queueContent: { padding: 16, gap: 12 },
	
	queueItem: { 
		backgroundColor: COLORS.darkPaper, borderWidth: 3, borderColor: COLORS.ink, padding: 14,
		shadowColor: COLORS.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
	},
	queueItemActive: { backgroundColor: COLORS.ink, shadowOpacity: 0, transform: [{ translateX: 4 }, { translateY: 4 }] },
	queueItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
	queueId: { fontSize: 16, fontWeight: '900', color: COLORS.ink },
	statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderWidth: 2, borderColor: COLORS.ink },
	statusBadgeText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '900', color: COLORS.ink },
	queueTxn: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700', color: COLORS.muted },

	mainContent: { flex: 1 ,  backgroundColor: COLORS.darkPaper  , padding: 24, borderColor: COLORS.ink},
	// Mobile: drop flex:1 for the same reason as dashboardBodyMobile above.
	mainContentMobile: { backgroundColor: COLORS.darkPaper, padding: 24, borderColor: COLORS.ink, width: '100%' },
	mainScrollView: { flex: 1, minWidth: 0 ,paddingBottom: 24},
	mainScroll: { flexGrow: 1,gap:20, padding: 24 ,paddingBottom: 24, width: Dimensions.get('window').width/1.37, },
	// Mobile stack for the two panels: plain block stacking, no flexGrow tug-of-war.
	mobilePanelStack: { flexDirection: 'column', gap: 15, padding: 24, paddingBottom: 24, width: '100%' , height:Dimensions.get('window').height/1.7, minHeight: 0, minWidth: 0 },
	centerPanel: { flex: 1.8, minWidth: 0 , flexDirection: 'column', gap: 24, alignItems: 'center' , justifyContent: 'flex-start'},
	rightPanel: { flex: 1, minWidth: 0 , flexDirection: 'column', gap: 24, alignItems: 'center' , justifyContent: 'flex-start'},
	// Mobile: cancel the flex-grow weighting above (1.8 vs 1) — with no definite
	// parent height to divide, the smaller-weighted rightPanel was resolving to
	// 0 height and disappearing entirely. Just size each panel to its content.
	mobileStackPanel: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: '100%' },
	
	cardBrutal: { 
		backgroundColor: COLORS.paper, borderWidth: 3, borderColor: COLORS.ink, padding: 24, marginBottom: 24,
		shadowColor: COLORS.ink, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0
	},
	cardHeader: { borderBottomWidth: 3, borderBottomColor: COLORS.ink, paddingBottom: 16, marginBottom: 20 },
	cardEyebrow: { fontFamily: 'monospace', fontSize: 14, fontWeight: '900', color: COLORS.ink },

	traceBlock: { flexDirection: 'row', gap: 16, marginBottom: 24 },
	traceIconBox: { width: 44, height: 44, borderWidth: 3, borderColor: COLORS.ink, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
	traceContent: { flex: 1 },
	traceLabel: { fontFamily: 'monospace', fontSize: 12, fontWeight: '900', color: COLORS.ink, marginBottom: 6 },
	traceText: { fontSize: 15, fontWeight: '700', lineHeight: 22, color: COLORS.muted },
	bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8, paddingRight: 10 },

	dialContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20, position: 'relative' },
	dialTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
	dialPercent: { fontSize: 32, fontWeight: '900', color: COLORS.ink },
	dialLabel: { fontFamily: 'monospace', fontSize: 10, fontWeight: '900', color: COLORS.muted },
	verdictText: { fontSize: 24, fontWeight: '900', marginTop: 10, textAlign: 'center' },

	actionSectionHeader: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900', color: COLORS.muted, marginBottom: 8 },
	actionPill: { 
		flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
		backgroundColor: COLORS.darkPaper, borderWidth: 2, borderColor: COLORS.ink, 
		paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 
	},
	actionText: { fontFamily: 'monospace', fontSize: 12, fontWeight: '900', color: COLORS.ink },
	routeBadge: { backgroundColor: COLORS.ink, paddingHorizontal: 6, paddingVertical: 2 },
	routeText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '900', color: COLORS.paper },
	transitionBox: { marginTop: 16, padding: 12, backgroundColor: COLORS.ink },
	transitionLabel: { fontFamily: 'monospace', fontSize: 10, fontWeight: '900', color: COLORS.lime, marginBottom: 4 },
	transitionText: { fontSize: 13, fontWeight: '700', color: COLORS.paper, lineHeight: 18 }
});