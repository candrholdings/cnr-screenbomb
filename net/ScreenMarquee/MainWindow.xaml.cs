using System;
using System.Threading;
using System.Windows;

namespace ScreenMarquee
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();

            var viewModel = new MarqueeViewModel();

            this.DataContext = viewModel;
            this.Left = 0;

            var fullHeight = SystemParameters.VirtualScreenHeight;
            var fullWidth = SystemParameters.VirtualScreenWidth;
            var random = new Random();

            this.Top = random.NextDouble() * (fullHeight - this.Height);
            this.Width = SystemParameters.VirtualScreenWidth;

            var args = Environment.GetCommandLineArgs();
            var message = args.Length > 1 ? args[1] : "Hello, World!";

            this.Label.Content = message;
            this.Label.Measure(new Size(double.PositiveInfinity, this.Height));

            viewModel.Done += this.viewModel_Done;
            viewModel.Start(fullWidth + 500, -500 - this.Label.DesiredSize.Width, TimeSpan.FromSeconds(5));
        }

        void viewModel_Done(object sender, EventArgs e)
        {
            Dispatcher.Invoke(() =>
            {
                Application.Current.Shutdown(0);
            });
        }
    }
}
