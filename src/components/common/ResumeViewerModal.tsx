import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, ExternalLink, FileText } from 'lucide-react-native';
import { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface ResumeViewerModalProps {
  visible: boolean;
  url: string | null;
  onClose: () => void;
  title?: string;
}

export const ResumeViewerModal: React.FC<ResumeViewerModalProps> = ({
  visible,
  url,
  onClose,
  title = 'Resume Viewer',
}) => {
  const [loading, setLoading] = React.useState(true);
  const webViewRef = React.useRef<WebView>(null);
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const isGoogleViewable = url ? (
    url.toLowerCase().includes('.pdf') ||
    url.toLowerCase().includes('.doc') ||
    url.toLowerCase().includes('.docx') ||
    (title && (
      title.toLowerCase().endsWith('.pdf') ||
      title.toLowerCase().endsWith('.doc') ||
      title.toLowerCase().endsWith('.docx')
    ))
  ) : false;

  const isLocalUrl = React.useCallback((urlStr: string | null) => {
    if (!urlStr) return false;
    const lower = urlStr.toLowerCase();
    return (
      lower.includes('localhost') ||
      lower.includes('127.0.0.1') ||
      lower.includes('10.0.2.2') ||
      /https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(lower)
    );
  }, []);

  const sourceUrl = React.useMemo(() => {
    if (!url) return '';
    if (Platform.OS === 'android' && isGoogleViewable) {
      
      const separator = url.includes('?') ? '&' : '?';
      const urlWithBuster = `${url}${separator}cb=${Date.now()}`;
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(urlWithBuster)}`;
    }
    return url;
  }, [url, isGoogleViewable]);

  if (!url) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => Linking.openURL(url)}
            activeOpacity={0.7}
          >
            <ExternalLink size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {Platform.OS === 'android' && isLocalUrl(url) ? (
          <View style={styles.androidFallback}>
            <View style={styles.iconContainer}>
              <FileText size={48} color={colors.primary} />
            </View>
            <Text style={styles.fallbackTitle}>Local Document</Text>
            <Text style={styles.fallbackSubtitle}>
              Google Docs Viewer cannot load local development URLs (localhost/private IPs) on Android.
            </Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() => Linking.openURL(url)}
              activeOpacity={0.8}
            >
              <ExternalLink size={18} color="#fff" />
              <Text style={styles.openButtonText}>Open in Browser</Text>
            </TouchableOpacity>
          </View>
        ) : (
          
          <View style={styles.webContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: sourceUrl }}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              style={styles.webView}
              scalesPageToFit={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loaderText}>Loading resume...</Text>
                </View>
              )}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: 'Space Grotesk',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  closeButton: {
    padding: 6,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  refreshButton: {
    padding: 6,
    backgroundColor: isDark ? colors.surface : '#EEF2FF',
    borderRadius: 20,
  },
  webContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: 'Inter',
  },
  
  androidFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: isDark ? colors.surface : '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: 'Space Grotesk',
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 22,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  openButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter',
  },
});

export default ResumeViewerModal;
