
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import MainLayout from "@/components/layout/MainLayout";
import TradingViewChart from "@/components/widgets/TradingViewChart";

const Index = () => {
  return (
    <ThemeProvider defaultTheme="dark">
      <MainLayout>
        <TradingViewChart 
          symbol="BINANCE:ETHUSDT"
          interval="D"
          theme="dark"
          autosize={true}
        />
      </MainLayout>
    </ThemeProvider>
  );
};

export default Index;
