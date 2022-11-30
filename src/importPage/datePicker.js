export class DatePicker {
    constructor() {
        this.date = new Date();
        this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.dayNames = ['Mon', 'Tue', 'Wed','Thu', 'Fri', 'Sat', 'Sun'];
        this.year = new Date().getFullYear();
        this.month = new Date().getMonth();
        this.day = new Date().getDate();
        this.DOMelement = document.createElement('div');

        this._initializeDOMelement();
    }

    _initializeDOMelement() {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = `${this.day}/${this.month + 1}/${this.year}`;
        const datePickerDOMelement = document.createElement('div');
        datePickerDOMelement.classList.add('date-picker');

        this.DOMelement.appendChild(input);
        this.DOMelement.appendChild(datePickerDOMelement);

        const yearBackButton = document.createElement('button');
        yearBackButton.innerHTML = "&#171;";
        yearBackButton.classList.add('date-picker-year-back');
        const monthBackButton  = document.createElement('button');
        monthBackButton.innerHTML = "&#8249;";
        yearBackButton.classList.add('date-picker-month-back')


        const currentMonthYear = document.createElement('span');
        currentMonthYear.classList.add("date-picker-monthyear");
        currentMonthYear.textContent = `${this.monthNames[this.date.getMonth()]} ${this.date.getFullYear()}`;

        const monthForwardButton = document.createElement('button');
        monthForwardButton.innerHTML = "&#8250;";
        yearBackButton.classList.add('date-picker-month-forward')
        const yearForwardButton = document.createElement('button');
        yearForwardButton.innerHTML = "&#187;";
        yearBackButton.classList.add('date-picker-year-forward');

        const dayTable = this._getDayTable(this.date);

        datePickerDOMelement.replaceChildren(yearBackButton,monthBackButton,currentMonthYear, monthForwardButton, yearForwardButton,dayTable);

        const msPerYear = 365 * 24 * 60 * 60 * 1000;
        const msPerMonth = msPerYear / 12;

        // select day event listener
        datePickerDOMelement.addEventListener('click', (e) => {
            if (e.target instanceof HTMLTableCellElement) {
                // year 
                const selectedYear = this.year;

                // day
                const selectedDay = Number(e.target.textContent);

                // month
                let selectedMonth = this.month;

                if(e.target.classList.contains('date-picker-previous-month')) {
                    selectedMonth -= 1;
                } else if (e.target.classList.contains('date-picker-next-month')) {
                    selectedMonth += 1;
                } 

                const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
                
                input.value = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`
            }
        })

        // button event listeners
        yearBackButton.addEventListener('click', (e) => {
            e.preventDefault();
            this._updateDate(this.date.getTime() - msPerYear);
        })

        monthBackButton.addEventListener('click', (e) => {
            e.preventDefault();
            this._updateDate(this.date.getTime() - msPerMonth);
        })

        monthForwardButton.addEventListener('click', (e) => {
            e.preventDefault();
            this._updateDate(this.date.getTime() + msPerMonth);
        })

        yearForwardButton.addEventListener('click', (e) => {
            e.preventDefault();
            this._updateDate(this.date.getTime() + msPerYear);
        })

    }

    getDOMinputElement() {
        return this.DOMelement;
    }

    _getDayTable(dateObj) {
        const table = document.createElement('table');

        // names of days of the week
        let tableRow = document.createElement('tr')
        for(const day of this.dayNames) {
            let tableHeading =  document.createElement('th');
            tableHeading.innerText = day;
            tableRow.appendChild(tableHeading);
        }
        table.appendChild(tableRow);


        const msPerDay = 24 * 60 * 60 * 1000;
        // trick = using 0th day in the next month
        const numberOfDaysInCurrentMonth = new Date(dateObj.getFullYear(),dateObj.getMonth() + 1,0).getDate();

        const firstDayOfMonthDate = new Date(dateObj.getTime() - (dateObj.getDate() - 1) * msPerDay);
        const lastDayOfMonthDate = new Date(dateObj.getTime() + (numberOfDaysInCurrentMonth - dateObj.getDate()) * msPerDay);

        const firstRowDayOffset = this._getDayWeekOrder(firstDayOfMonthDate);
        const lastRowDayOffset = this._getDayWeekOrder(lastDayOfMonthDate);

        // number of rows
        const numberOfRows = Math.ceil((numberOfDaysInCurrentMonth + firstRowDayOffset + (7 - 1 - lastRowDayOffset) ) / 7 );
       
        // table data:
        // 5 rows with 7 columns
        let tableDataDate;
        let className = '';
        let tableData;

        // first row
        tableRow = document.createElement('tr');
        for(let i = 0; i < 7; i++) {

            if( i < firstRowDayOffset) {
                tableDataDate = new Date(firstDayOfMonthDate.getTime() - (firstRowDayOffset - i) * msPerDay);
                className = 'date-picker-previous-month';
            } else {
                tableDataDate = new Date(firstDayOfMonthDate.getTime() + (i - firstRowDayOffset) * msPerDay);
                className = 'date-picker-current-month';
            }

            tableData = this._createTableData(tableDataDate,className);
            tableRow.appendChild(tableData)
        }
        table.appendChild(tableRow);

        // rows after first, before last one:
        for(let row = 1; row < (numberOfRows - 1); row++) {
            tableRow = document.createElement('tr');

            for(let i = 0; i < 7; i++) {
                className = 'date-picker-current-month';
                tableDataDate = new Date(firstDayOfMonthDate.getTime() // 1st day of the month
                + (7 - firstRowDayOffset) * msPerDay  // 1st row offset
                + (row - 1) * 7 * msPerDay // all rows except the 1st one
                + i * msPerDay); // offset on the current row

                tableData = this._createTableData(tableDataDate,className);
                tableRow.appendChild(tableData);
            }

            table.appendChild(tableRow);
        }


        // last row
        tableRow = document.createElement('tr');
        for(let i = 0; i < 7; i++) {
            if( i <= lastRowDayOffset) {
                tableDataDate = new Date(lastDayOfMonthDate.getTime() - (lastRowDayOffset - i) * msPerDay);
                className = 'date-picker-current-month';
            } else {
                tableDataDate = new Date(lastDayOfMonthDate.getTime() + (i - lastRowDayOffset) * msPerDay);
                className = 'date-picker-next-month';
            }
            tableData = this._createTableData(tableDataDate,className);
            tableRow.appendChild(tableData);
        }
        table.appendChild(tableRow);



        return table;
    }

    _getDayWeekOrder(dateObj) {
        // assumes Mon = 1st day of the week, returns 0
        // Sun = last, returns 6

        let order = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
        return order;
    }

    _createTableData(dateObj, className) {

        let tableData = document.createElement('td');
        tableData.classList.add(className);
        tableData.innerText = dateObj.getDate();

        return tableData;

    }
 
 
    _rerender() {
        const datePickerDOM = this.DOMelement.querySelector('.date-picker');
        const monthYearSpan = datePickerDOM.querySelector('.date-picker-monthyear');
        monthYearSpan.textContent = `${this.monthNames[this.date.getMonth()]} ${this.date.getFullYear()}`;

        const table = datePickerDOM.querySelector('table');
        datePickerDOM.replaceChild(this._getDayTable(this.date), table);

    }
    
    _updateDate(ms) {
        const dateObj = new Date(ms);
    
        this.date = dateObj;
        this.year = dateObj.getFullYear();
        this.month = dateObj.getMonth();
        this.day = dateObj.getDate();

        this._rerender();
    }

}