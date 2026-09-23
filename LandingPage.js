import React, { useRef, useState } from 'react';
import {
	Animated,
	Dimensions,
	Linking,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
	Image
} from 'react-native';
import Svg, { Circle, Defs, FeGaussianBlur, Filter, G, Path } from 'react-native-svg';
import {
	ArrowDownRight,
	ArrowUpRight,
	Check,
	ChevronDown,
	CircleDot,
	ExternalLink,
	Github,
	GitBranch,
	Menu,
	Network,
	Radio,
	ShieldCheck,
	Sparkles,
	Terminal,
	X,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLORS = {
	ink: '#090909',
	paper: '#FDFBF7',
	orange: '#FF5C00',
	lime: '#CCFF00',
	cyan: '#00F0FF',
	pink: '#FF3366',
	muted: '#6E6A63',
};

const metrics = [
	['590,742', 'TRANSACTIONS INGESTED', COLORS.orange],
	['144,432', 'DEVICE IDENTITY PROFILES', COLORS.cyan],
	['20 / 20', 'EXAM CASES FULLY RESOLVED', COLORS.lime],
	['0%', 'VECTOR HALLUCINATION', COLORS.pink],
];

const outputs = [
	['01', 'CASE RECORD', 'Structured evidence, exposure, and approval route.', COLORS.orange],
	['02', 'SAR NARRATIVE', 'FinCEN-grade who / what / when / where / how.', COLORS.cyan],
	['03', 'NEXT BEST ACTIONS', 'Recommendations evolve as customer intent arrives.', COLORS.lime],
];

const schema = [
	['VERTICES', 'Customer, Card, Transaction, DeviceProfile, BillingRegion, EmailDomain, CaseRecord'],
	['EDGES', 'OWNS, MADE, FROM_DEVICE, BILLED_IN, PURCHASER_EMAIL, case_of_customer'],
	['DEFENSE', 'High-degree BillingRegion and EmailDomain nodes are bounded before context expansion.'],
];

function LiquidBackdrop() {
	const drift = useRef(new Animated.Value(0)).current;

	React.useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(drift, { toValue: 1, duration: 6500, useNativeDriver: true }),
				Animated.timing(drift, { toValue: 0, duration: 6500, useNativeDriver: true }),
			]),
		).start();
	}, [drift]);

	const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-18, 22] });
	const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [12, -12] });

	return (
		<View pointerEvents="none" style={StyleSheet.absoluteFill}>
			<Svg width={width} height={390} viewBox={`0 0 ${width} 390`}>
				<Defs>
					<Filter id="blur"><FeGaussianBlur stdDeviation="26" /></Filter>
				</Defs>
				<Animated.View style={{ transform: [{ translateX }, { translateY }] }}>
					<G opacity={0.82} filter="url(#blur)">
						<Circle cx={width * 0.12} cy="78" r="90" fill={COLORS.cyan} />
						<Circle cx={width * 0.9} cy="38" r="105" fill={COLORS.pink} />
						<Circle cx={width * 0.63} cy="290" r="118" fill={COLORS.lime} />
					</G>
				</Animated.View>
				<Path d={`M0 210 C${width * 0.2} 180 ${width * 0.3} 250 ${width * 0.5} 205 S${width * 0.8} 180 ${width} 220`} stroke={COLORS.ink} strokeWidth="2" fill="none" opacity="0.18" />
			</Svg>
		</View>
	);
}

function BrutalButton({ children, onPress, color = COLORS.orange, icon }) {
	return (
		<Pressable onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: color }, pressed && styles.pressed]}>
			<Text style={styles.buttonText}>{children}</Text>
			{icon || <ArrowUpRight size={18} color={COLORS.ink} strokeWidth={3} />}
		</Pressable>
	);
}

function Reveal({ children, style }) {
	return <View style={[styles.reveal, style]}>{children}</View>;
}

function SectionTitle({ index, kicker, title }) {
	return (
		<View style={styles.sectionTitle}>
			<Text style={styles.sectionIndex}>{index}</Text>
			<View style={{ flex: 1 }}>
				<Text style={styles.kicker}>{kicker}</Text>
				<Text style={styles.h2}>{title}</Text>
			</View>
		</View>
	);
}

export default function LandingPage({ navigation }) {
	const scrollRef = useRef(null);
	const [progress, setProgress] = useState(0);
	const [activeMode, setActiveMode] = useState('agent');
	const [codeOpen, setCodeOpen] = useState(true);

	const goTo = (y) => scrollRef.current?.scrollTo({ y, animated: true });
	const openDashboard = () => navigation.navigate('Dashboard');
	const openLink = (url) => Linking.openURL(url);

	return (
		<View style={styles.screen}>
			<View style={styles.progressTrack}><View style={[styles.progress, { width: `${progress * 100}%` }]} /></View>
			<ScrollView
				ref={scrollRef}
				stickyHeaderIndices={[0]}
				onScroll={(event) => {
					const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
					const max = contentSize.height - layoutMeasurement.height;
					setProgress(max > 0 ? contentOffset.y / max : 0);
				}}
				scrollEventThrottle={16}
                style={{height:Dimensions.get('window').height}}
			>
				<View style={styles.header}>
					<View style={styles.brandRow}><Image source={require('../assets/logo.png')} style={styles.brandImage} /><Text style={styles.brand}>VULKAN</Text><Text style={styles.brandSlash}>// AGENTIC_GRAPHRAG</Text></View>
					<View style={styles.headerRight}>
						<View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText}>TIGERGRAPH SAVANNA: CONNECTED</Text><Text style={styles.statusNodes}>(590K+ NODES)</Text></View>
						<BrutalButton color={COLORS.orange} onPress={openDashboard}>LAUNCH AGENT DASHBOARD</BrutalButton>
						<Menu size={26} color={COLORS.ink} style={styles.mobileMenu} />
					</View>
				</View>

				<View style={styles.hero}>
					<LiquidBackdrop />
					<View style={styles.heroCopy}>
						<View style={styles.eyebrow}><CircleDot size={14} color={COLORS.ink} strokeWidth={3} /><Text style={styles.eyebrowText}>HACKER HOUSE GOA 2026 // BENCHMARK SUBMISSION</Text></View>
						<Text style={styles.heroTitle}>GRAPH-NATIVE AI FOR AUTONOMOUS FRAUD INVESTIGATION.</Text>
						<Text style={styles.heroSub}>How we solved relational fraud syndicates by ditching vector embeddings for zero-abstraction TigerGraph MCP traversal.</Text>
						<View style={styles.heroMeta}><Text style={styles.mono}>VULKAN / TECHNICAL FIELD NOTES / 08.26</Text><ArrowDownRight size={22} color={COLORS.ink} /></View>
					</View>
					<View style={styles.metricGrid}>{metrics.map(([value, label, color]) => <View key={label} style={[styles.metricCard, { backgroundColor: color }]}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text>{label === 'VECTOR HALLUCINATION' && <Text style={styles.metricNote}>DETERMINISTIC GRAPH TRAVERSAL</Text>}</View>)}</View>
				</View>

				<View style={styles.ticker}><Text style={styles.tickerText}>RELATIONAL SIGNALS OVER SEMANTIC GUESSING</Text><Sparkles size={16} color={COLORS.lime} /><Text style={styles.tickerText}>MCP // TIGERGRAPH // AGENTIC GRAPHRAG</Text><Sparkles size={16} color={COLORS.lime} /></View>

				<View style={styles.article}>
					<Reveal><SectionTitle index="01" kicker="THE PREMISE" title="WHAT WE BUILT" /><Text style={styles.lead}>Vulkan is a Tier 2 autonomous fraud investigation system designed to eliminate analyst fatigue and false positives. It turns a raw alert into a defensible action by walking the graph, asking only the next useful question, and preserving every decision.</Text><Text style={styles.body}>The system runs in two operational modes. <Text style={styles.bold}>agent.py</Text> is an autonomous multi-turn agent over Model Context Protocol with local stdio communication. <Text style={styles.bold}>batch_runner.py</Text> is a high-throughput single-turn GraphRAG pipeline that evaluates all 20 benchmark cases under strict API rate limits and emits compliant three-part JSON.</Text></Reveal>

					<Reveal style={styles.archCard}><View style={styles.cardHeader}><Text style={styles.cardEyebrow}>CASE ARCHITECTURE ARTIFACT</Text><ShieldCheck size={22} color={COLORS.ink} /></View><Text style={styles.cardTitle}>ONE INVESTIGATION. THREE DEFENSIBLE OUTPUTS.</Text>{outputs.map(([number, title, copy, color]) => <View key={title} style={styles.outputRow}><View style={[styles.outputNumber, { backgroundColor: color }]}><Text style={styles.outputNumberText}>{number}</Text></View><View style={{ flex: 1 }}><Text style={styles.outputTitle}>{title}</Text><Text style={styles.outputCopy}>{copy}</Text></View><Check size={20} color={COLORS.ink} strokeWidth={3} /></View>)}</Reveal>

					<Reveal><SectionTitle index="02" kicker="THE GRAPH" title="ZERO-ABSTRACTION GRAPHRAG" /><Text style={styles.lead}>Fraud is fundamentally relational, not semantic. Embeddings can tell you that two records sound similar. They cannot calculate path distance, identify ring topologies, or isolate device-fingerprint reuse across disparate customer records.</Text><View style={styles.pipeline}>{[['01', 'RAW ALERT', COLORS.orange], ['02', 'MCP TOOL ENGINE', COLORS.cyan], ['03', 'NEIGHBORHOOD EXPANSION', COLORS.lime], ['04', 'DYNAMIC STEP-UP AUTH', COLORS.pink], ['05', 'STATE DECISION MATRIX', COLORS.paper]].map(([number, title, color], index) => <React.Fragment key={title}><View style={[styles.pipelineNode, { backgroundColor: color }]}><Text style={styles.pipelineNumber}>{number}</Text><Text style={styles.pipelineText}>{title}</Text></View>{index < 4 && <ArrowUpRight size={20} color={COLORS.ink} style={styles.pipelineArrow} />}</React.Fragment>)}</View></Reveal>

					<Reveal style={styles.codeCard}><Pressable onPress={() => setCodeOpen(!codeOpen)} style={styles.codeTop}><View style={styles.windowDots}><View style={[styles.dot, { backgroundColor: COLORS.pink }]} /><View style={[styles.dot, { backgroundColor: COLORS.lime }]} /><View style={[styles.dot, { backgroundColor: COLORS.cyan }]} /></View><Text style={styles.codeTopText}>MCP_TOOL_DEFINITIONS.PY</Text>{codeOpen ? <ChevronDown size={20} color={COLORS.paper} /> : <ChevronDown size={20} color={COLORS.paper} style={{ transform: [{ rotate: '-90deg' }] }} />}</Pressable>{codeOpen && <Text style={styles.code}>{`@tool get_node(node_id, node_type)\n@tool get_node_edges(node_id, edge_types)\n@tool request_customer_validation(case_id)\n@tool update_case_memory(case_id, decision)\n\n# evidence stays in the graph\n# the model only orchestrates traversal`}</Text>}</Reveal>

					<Reveal><SectionTitle index="03" kicker="THE SCHEMA" title="HOW TIGERGRAPH IS USED" /><Text style={styles.lead}>A compact vertex-edge hierarchy makes every answer inspectable. The GSQL loading pipeline, executed through pyTigerGraph, bulk-ingested more than 590,000 nodes into TigerGraph Cloud.</Text><View style={styles.schemaBox}>{schema.map(([label, value]) => <View key={label} style={styles.schemaRow}><Text style={styles.schemaLabel}>{label}</Text><Text style={styles.schemaValue}>{value}</Text></View>)}</View><View style={styles.callout}><Text style={styles.calloutTitle}>THE SUPERNODE DEFENSE</Text><Text style={styles.calloutText}>BillingRegion and EmailDomain are high-degree vertices. Vulkan applies custom traversal guardrails before expansion, protecting the context window while still extracting exact regional mismatch signals.</Text></View></Reveal>

					<Reveal><SectionTitle index="04" kicker="THE DECISION LOOP" title="AGENTIC CAPABILITIES & UNCERTAINTY" /><Text style={styles.lead}>Vulkan moves from uncertain signals to defensible actions under Bank Policy rules R1-R10. It refuses to block a legitimate customer just because the model feels suspicious.</Text><View style={styles.modeToggle}><Pressable onPress={() => setActiveMode('agent')} style={[styles.modeButton, activeMode === 'agent' && styles.modeActive]}><Radio size={17} color={COLORS.ink} /><Text style={styles.modeText}>LIVE AGENT</Text></Pressable><Pressable onPress={() => setActiveMode('batch')} style={[styles.modeButton, activeMode === 'batch' && styles.modeActive]}><GitBranch size={17} color={COLORS.ink} /><Text style={styles.modeText}>BATCH RUNNER</Text></Pressable></View><View style={styles.uncertainty}><Text style={styles.mono}>FRAUD PROBABILITY / {activeMode === 'agent' ? '0.30 - 0.70' : '20 CASES / 20 RESOLVED'}</Text><View style={styles.uncertaintyBar}><View style={styles.uncertaintyFill} /></View><View style={styles.decisionRow}><Text style={styles.decisionPill}>VERIFY_WITH_CUSTOMER</Text><ArrowUpRight size={20} color={COLORS.ink} /><Text style={[styles.decisionPill, { backgroundColor: COLORS.lime }]}>BLOCK_CARD</Text><Text style={[styles.decisionPill, { backgroundColor: COLORS.paper }]}>CLOSE_NO_FRAUD</Text></View></View><Text style={styles.body}>The agent reads prior closed cases (CC-XXXX) to identify repeat patterns, then writes newly closed investigation artifacts back to TigerGraph memory. High-exposure syndicate attacks also produce standalone FinCEN-grade SAR narratives with who, what, when, where, and how.</Text></Reveal>

					<Reveal><SectionTitle index="05" kicker="THE RETROSPECTIVE" title="WHAT WE LEARNED" /><View style={styles.lessonGrid}><View style={[styles.lesson, { backgroundColor: COLORS.orange }]}><Text style={styles.lessonNum}>01</Text><Text style={styles.lessonTitle}>TOKEN DEBT IS REAL</Text><Text style={styles.lessonText}>Multi-turn LLM loops over live MCP pipes accumulate context fast. Focused retrieval keeps the API alive.</Text></View><View style={[styles.lesson, { backgroundColor: COLORS.cyan }]}><Text style={styles.lessonNum}>02</Text><Text style={styles.lessonTitle}>POLICY IS A FEATURE</Text><Text style={styles.lessonText}>An unconstrained LLM over-blocks edge cases. Deterministic auto, L1, and L2 routing makes autonomy accountable.</Text></View></View></Reveal>

					<Reveal><SectionTitle index="06" kicker="THE NEXT BUILD" title="WHAT WE WOULD IMPROVE" /><View style={styles.improvementList}>{[['LIVE STREAMING INGESTION', 'Direct Kafka / Event Hub integration for sub-second alert processing.', COLORS.lime], ['GNN HYBRID SCORING', 'PageRank and Louvain inside TigerGraph alongside LLM reasoning.', COLORS.pink], ['HUMAN-IN-THE-LOOP CONSENSUS', 'Webhook dispatch for L1/L2 managerial approvals on high-exposure cards.', COLORS.cyan]].map(([title, copy, color]) => <View key={title} style={styles.improvement}><View style={[styles.improvementIcon, { backgroundColor: color }]}><ArrowUpRight size={22} color={COLORS.ink} strokeWidth={3} /></View><View style={{ flex: 1 }}><Text style={styles.outputTitle}>{title}</Text><Text style={styles.outputCopy}>{copy}</Text></View></View>)}</View></Reveal>

					<View style={styles.cta}><Text style={styles.ctaKicker}>THE PROOF IS IN THE ARTIFACTS</Text><Text style={styles.ctaTitle}>EXPLORE THE 20 BENCHMARK INVESTIGATION ARTIFACTS.</Text><BrutalButton color={COLORS.lime} onPress={openDashboard} icon={<ExternalLink size={18} color={COLORS.ink} strokeWidth={3} />}>TRY AGENT / VIEW DASHBOARD</BrutalButton></View>
					<View style={styles.footer}><Text style={styles.footerBrand}>VULKAN // 2026</Text><View style={styles.footerLinks}><Pressable onPress={() => openLink('https://github.com')} style={styles.footerLink}><Github size={16} color={COLORS.ink} /><Text style={styles.footerLinkText}>GITHUB</Text></Pressable><Pressable onPress={() => openLink('https://docs.tigergraph.com')} style={styles.footerLink}><Network size={16} color={COLORS.ink} /><Text style={styles.footerLinkText}>TIGERGRAPH DOCS</Text></Pressable><Pressable onPress={() => openLink('https://hackathon.dev')} style={styles.footerLink}><Terminal size={16} color={COLORS.ink} /><Text style={styles.footerLinkText}>SUBMISSION</Text></Pressable></View></View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: COLORS.paper },
	brandImage: { width: 30, height: 30, resizeMode: 'contain' },
	progressTrack: { position: 'absolute', zIndex: 10, top: 0, left: 0, right: 0, height: 6, backgroundColor: COLORS.ink },
	progress: { height: 6, backgroundColor: COLORS.lime },
	header: { minHeight: 76, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 14, backgroundColor: COLORS.paper, borderBottomWidth: 3, borderBottomColor: COLORS.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
	brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
	brandMark: { width: 32, height: 32, borderWidth: 3, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.lime },
	brand: { fontSize: 22, fontWeight: '900', letterSpacing: -1 }, brandSlash: { fontFamily: 'monospace', fontSize: 11, fontWeight: '800' },
	headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 }, mobileMenu: { display: 'none' },
	status: { borderWidth: 2, borderColor: COLORS.ink, backgroundColor: COLORS.lime, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }, statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.ink }, statusText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, statusNodes: { fontFamily: 'monospace', fontSize: 9 },
	button: { minHeight: 44, paddingHorizontal: 14, borderWidth: 3, borderColor: COLORS.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: COLORS.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }, pressed: { transform: [{ translateX: 4 }, { translateY: 4 }], shadowOpacity: 0, elevation: 0 }, buttonText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.2 },
	hero: { minHeight: 580, paddingHorizontal: 22, paddingTop: 70, paddingBottom: 42, position: 'relative', overflow: 'hidden' }, heroCopy: { maxWidth: 1020 }, eyebrow: { alignSelf: 'flex-start', backgroundColor: COLORS.pink, borderWidth: 3, borderColor: COLORS.ink, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 7, shadowColor: COLORS.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }, eyebrowText: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900' }, heroTitle: { fontSize: width > 700 ? 76 : 48, lineHeight: width > 700 ? 76 : 51, fontWeight: '900', letterSpacing: -3, marginTop: 28, maxWidth: 1020, color: COLORS.ink }, heroSub: { fontSize: 19, lineHeight: 27, fontWeight: '700', maxWidth: 680, marginTop: 24 }, heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 30 }, mono: { fontFamily: 'monospace', fontSize: 11, fontWeight: '800', letterSpacing: 0.2 }, metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 52 }, metricCard: { borderWidth: 3, borderColor: COLORS.ink, padding: 14, minWidth: width > 700 ? 190 : (width - 56) / 2, flex: width > 700 ? 1 : 0, minHeight: 104, justifyContent: 'space-between', shadowColor: COLORS.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 }, metricValue: { fontSize: 29, fontWeight: '900', letterSpacing: -1 }, metricLabel: { fontFamily: 'monospace', fontSize: 10, fontWeight: '900', marginTop: 8 }, metricNote: { fontFamily: 'monospace', fontSize: 8, marginTop: 4 }, ticker: { backgroundColor: COLORS.ink, minHeight: 43, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', gap: 10, flexWrap: 'wrap' }, tickerText: { color: COLORS.paper, fontFamily: 'monospace', fontSize: 10, fontWeight: '900' },
	article: { maxWidth: 1060, width: '100%', alignSelf: 'center', paddingHorizontal: 22, paddingVertical: 72 }, reveal: { marginBottom: 90 }, sectionTitle: { flexDirection: 'row', gap: 18, alignItems: 'flex-start', marginBottom: 24 }, sectionIndex: { fontFamily: 'monospace', fontSize: 16, fontWeight: '900', backgroundColor: COLORS.lime, borderWidth: 3, borderColor: COLORS.ink, paddingHorizontal: 8, paddingVertical: 6 }, kicker: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900', color: COLORS.muted, marginBottom: 6 }, h2: { fontSize: width > 700 ? 51 : 37, lineHeight: width > 700 ? 53 : 40, fontWeight: '900', letterSpacing: -2 }, lead: { fontSize: 23, lineHeight: 31, fontWeight: '700', maxWidth: 850 }, body: { fontSize: 16, lineHeight: 26, marginTop: 22, maxWidth: 820 }, bold: { fontWeight: '900' }, archCard: { backgroundColor: COLORS.orange, borderWidth: 3, borderColor: COLORS.ink, padding: 22, shadowColor: COLORS.ink, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, cardEyebrow: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900' }, cardTitle: { fontSize: 30, lineHeight: 31, fontWeight: '900', maxWidth: 600, marginTop: 20, marginBottom: 22 }, outputRow: { borderTopWidth: 2, borderTopColor: COLORS.ink, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 13 }, outputNumber: { width: 38, height: 38, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' }, outputNumberText: { fontFamily: 'monospace', fontWeight: '900' }, outputTitle: { fontSize: 16, fontWeight: '900' }, outputCopy: { fontSize: 14, lineHeight: 19, marginTop: 3 },
	pipeline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 9, marginTop: 32 }, pipelineNode: { borderWidth: 3, borderColor: COLORS.ink, padding: 12, minHeight: 84, width: width > 700 ? 160 : (width - 66) / 2, justifyContent: 'space-between', shadowColor: COLORS.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }, pipelineNumber: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900' }, pipelineText: { fontSize: 13, fontWeight: '900' }, pipelineArrow: { transform: [{ rotate: '45deg' }] }, codeCard: { backgroundColor: COLORS.ink, borderWidth: 3, borderColor: COLORS.ink, shadowColor: COLORS.pink, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 }, codeTop: { minHeight: 50, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: '#555', flexDirection: 'row', alignItems: 'center', gap: 12 }, windowDots: { flexDirection: 'row', gap: 5 }, dot: { width: 11, height: 11, borderRadius: 6, borderWidth: 1, borderColor: COLORS.paper }, codeTopText: { color: COLORS.paper, fontFamily: 'monospace', fontSize: 11, fontWeight: '900', flex: 1 }, code: { color: COLORS.lime, fontFamily: 'monospace', fontSize: 13, lineHeight: 23, padding: 19 }, schemaBox: { borderWidth: 3, borderColor: COLORS.ink, marginTop: 30 }, schemaRow: { padding: 16, borderBottomWidth: 2, borderBottomColor: COLORS.ink, flexDirection: width > 700 ? 'row' : 'column', gap: 16 }, schemaLabel: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900', width: 82 }, schemaValue: { flex: 1, fontSize: 15, lineHeight: 21 }, callout: { marginTop: 18, padding: 19, backgroundColor: COLORS.cyan, borderWidth: 3, borderColor: COLORS.ink }, calloutTitle: { fontFamily: 'monospace', fontSize: 12, fontWeight: '900' }, calloutText: { fontSize: 17, lineHeight: 24, fontWeight: '700', marginTop: 9 }, modeToggle: { flexDirection: 'row', borderWidth: 3, borderColor: COLORS.ink, alignSelf: 'flex-start', marginTop: 26 }, modeButton: { paddingHorizontal: 13, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, modeActive: { backgroundColor: COLORS.orange }, modeText: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900' }, uncertainty: { backgroundColor: COLORS.paper, borderWidth: 3, borderColor: COLORS.ink, marginTop: 18, padding: 18, shadowColor: COLORS.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 }, uncertaintyBar: { height: 22, backgroundColor: COLORS.lime, borderWidth: 2, borderColor: COLORS.ink, marginTop: 13 }, uncertaintyFill: { width: '46%', height: '100%', backgroundColor: COLORS.pink, borderRightWidth: 3, borderRightColor: COLORS.ink }, decisionRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 18 }, decisionPill: { backgroundColor: COLORS.orange, borderWidth: 2, borderColor: COLORS.ink, paddingHorizontal: 9, paddingVertical: 7, fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, lessonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, lesson: { flex: 1, minWidth: width > 700 ? 300 : width - 44, borderWidth: 3, borderColor: COLORS.ink, padding: 20, minHeight: 180, shadowColor: COLORS.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 }, lessonNum: { fontFamily: 'monospace', fontWeight: '900' }, lessonTitle: { fontSize: 25, fontWeight: '900', marginTop: 25 }, lessonText: { fontSize: 15, lineHeight: 22, marginTop: 12, fontWeight: '700' }, improvementList: { borderTopWidth: 3, borderTopColor: COLORS.ink }, improvement: { paddingVertical: 18, borderBottomWidth: 2, borderBottomColor: COLORS.ink, flexDirection: 'row', gap: 15, alignItems: 'center' }, improvementIcon: { width: 48, height: 48, borderWidth: 3, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' }, cta: { backgroundColor: COLORS.pink, borderWidth: 3, borderColor: COLORS.ink, padding: width > 700 ? 38 : 24, shadowColor: COLORS.ink, shadowOffset: { width: 7, height: 7 }, shadowOpacity: 1, shadowRadius: 0 }, ctaKicker: { fontFamily: 'monospace', fontSize: 12, fontWeight: '900' }, ctaTitle: { fontSize: width > 700 ? 54 : 38, lineHeight: width > 700 ? 56 : 40, fontWeight: '900', letterSpacing: -2, maxWidth: 800, marginVertical: 18 }, footer: { paddingTop: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }, footerBrand: { fontSize: 16, fontWeight: '900' }, footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, footerLink: { borderWidth: 2, borderColor: COLORS.ink, paddingHorizontal: 9, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }, footerLinkText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '900' },
});
