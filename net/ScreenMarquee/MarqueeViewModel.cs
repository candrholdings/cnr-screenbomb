using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;

namespace ScreenMarquee
{
    public class MarqueeViewModel : INotifyPropertyChanged
    {
        public MarqueeViewModel()
        {
            this._timer.Elapsed += this.Timer_Elapsed;
        }

        private void Timer_Elapsed(object sender, ElapsedEventArgs e)
        {
            var elapsed = e.SignalTime - this._startTime;

            if (elapsed > this._duration)
            {
                elapsed = this._duration;
                this._timer.Stop();
                this.OnDone(EventArgs.Empty);
            }

            this.Elapsed = elapsed;
        }

        public event EventHandler Done;

        protected virtual void OnDone(EventArgs args)
        {
            if (this.Done != null)
            {
                this.Done(this, args);
            }
        }

        public void Start(double from, double to, TimeSpan duration)
        {
            this._from = from;
            this._to = to;
            this._duration = duration;
            this._startTime = DateTime.Now;
            this._timer.Start();
        }

        private double _from;
        private double _to;
        private Timer _timer = new Timer(10);

        public event PropertyChangedEventHandler PropertyChanged;

        public void NotifyPropertyChanged(string propertyName)
        {
            if (this.PropertyChanged != null)
            {
                this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }

        private DateTime _startTime;
        private TimeSpan _elapsed = TimeSpan.Zero;
        private TimeSpan _duration = TimeSpan.Zero;
        private string _text;

        public string Text
        {
            get { return this._text; }
            set
            {
                if (!string.Equals(this._text, value))
                {
                    this._text = value;
                    this.NotifyPropertyChanged("Text");
                }
            }
        }

        public TimeSpan Elapsed
        {
            get { return this._elapsed; }
            set
            {
                if (this._elapsed != value)
                {
                    this._elapsed = value;
                    this.NotifyPropertyChanged("Elapsed");
                    this.NotifyPropertyChanged("Percentage");
                    this.NotifyPropertyChanged("Value");
                }
            }
        }

        public float Percentage
        {
            get
            {
                if (TimeSpan.Equals(this._duration, TimeSpan.Zero))
                {
                    return 0;
                }
                else
                {
                    return (float)this._elapsed.Ticks / this._duration.Ticks;
                }
            }
        }

        public double Value
        {
            get
            {
                var range = this._to - this._from;

                return range * this.Percentage + this._from;
            }
        }
    }
}
