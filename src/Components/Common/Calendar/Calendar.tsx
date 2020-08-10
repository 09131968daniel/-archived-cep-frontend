import {
    format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameDay,
    addMonths, subMonths, isSameMonth, endOfWeek, parse, addYears, subYears
} from "date-fns";
// import "./Cal.css";
import React, { useState, useEffect } from "react";
import CalModal from "./Calmodal";
import axios from "axios";
import { useSelector } from "react-redux";
import { makeStyles, Button, Typography, TextField, StyleRules } from "@material-ui/core";

const useStyles: Function = makeStyles((theme): StyleRules => ({
    calendar: {
        display: "block",
        position: "relative",
        width: "90%",
        background: "white",
        border: "1px solid lightgray",
        height: "auto",
        margin: "0 auto",
    },
    header: {
        textTransform: "uppercase",
        fontWeight: 700,
        fontSize: "115%",
        padding: "1.5em 0",
        borderBottom: "1px solid lightgray",
    },
    icon: {
        display: "inline-block",
        verticalAlign: "middle",
        textAlign: "center",
        direction: "ltr",
        textRendering: "optimizeLegibility",
        fontFeatureSettings: "liga",
        cursor: "pointer",
        transition: ".15s ease-out",
    },
    days: {
        textTransform: "uppercase",
        fontWeight: 400,
        color: "gray",
        fontSize: "70%",
        padding: ".75em 0",
        borderBottom: " 1px solid lightgray",
    },
    body: {
    },
    cell: {
        position: "relative",
        height: "6em",
        borderRight: "1px solid lightgray",
        overflow: "hidden",
        cursor: "pointer",
        background: "white",
        transition: "0.25s ease- out",
        // background: "whitesmoke",
        // transition: "0.5s ease-out",
        // borderRight: "none",
    },
    selected: {
        borderLeft: "10px solid transparent",
        borderImage: "linear-gradient(45deg, #1affa0 0%,#cff153 40%)",
        borderImageSlice: 1,
    },
    row: {
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        width: "100%",
        borderBottom: "1px solid lightgray",
        // borderBottom: "none",
    },
    number: {
        position: "absolute",
        fontSize: "82.5%",
        lineHeight: 1,
        top: ".75em",
        right: ".75em",
        fontWeight: 700,
    },
    disabled: {
        color: "lightgray",
        pointerEvents: "none",
    },
    bg: {
        fontWeight: 700,
        lineHeight: 1,
        color: "#1affa0",
        opacity: 0,
        fontSize: "5em",
        position: "absolute",
        top: "-.2em",
        right: "-.05em",
        transition: ".25s ease- out",
        letterSpacing: "-.07em",
        // opacity: "0.2",
        // transition: ".5s ease-in",
    },
    column: {
        maxWidth: "100%",
        flexGrow: 0,
        flexBasis: "calc(100%/7)",
        width: "calc(100%/7)",
    }


}));

interface styleINF {
    calendar: string,
    header: string,
    icon: string,
    days: string,
    body: string,
    cell: string,
    selected: string,
    row: string,
    number: string,
    disabled: string,
    bg: string,
    column: string,
}
/**
 * Authors Armondo, Miki
 * Displays the intervents that is avaliable to the Admin
 */
export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const token = useSelector((state: any) => state.credReducer.token);
    const [allRequests, getAllRequests] = useState([]);

    const styles: styleINF = useStyles();

    useEffect(() => {
        axios
            .get(
                process.env.REACT_APP_ZUUL_ROUTE + "/interventions",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            .then((response) => {
                getAllRequests(response.data);
            })
            .catch((err) => console.log());
    }, []);
    /* Display the header that allows for moving Month and Year */
    const header = () => {
        const monthFormat = "MMMM";
        const yearFormat = "yyyy"
        return (
            <div className={`${styles.header} ${styles.row} flex-middle`}>
                <div className={`${styles.column} col-start`}>
                    <div className={styles.icon} onClick={prevMonth}>
                        &#60;
                    </div>
                </div>
                <div className={`${styles.column} col-center`}>
                    <span>{format(currentDate, monthFormat)}</span>
                </div>
                <div className={`${styles.column} col-end`}>
                    <div className={styles.icon} onClick={nextMonth}>
                        <span>&#62;</span>
                    </div>
                </div>
                <div className={`${styles.column} col-start`}>
                    <div className={styles.icon} onClick={prevYear}>
                        Prev Year
                    </div>
                </div>
                <div className={`${styles.column} col-center`}>
                    <span>{format(currentDate, yearFormat)}</span>
                </div>
                <div className={`${styles.column} col-end`}>
                    <div className={styles.icon} onClick={nextYear}>
                        Next Year
                    </div>
                </div>
            </div>
        );
    };
    /* Getting the days  */
    const days = () => {
        const dateFormat: string = "ddd";
        const days: Array<any> = [];
        let startDate: Date = startOfWeek(currentDate);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div className={`${styles.column} col-center`} key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }
        return <div className={`${styles.days} ${styles.row}`}>{days}</div>;
    };
    /* Making the cells */
    const cells = () => {
        /* this is a long winded way to get the data we needed */
        const monthStart: Date = startOfMonth(currentDate);
        const monthEnd: Date = endOfMonth(monthStart);
        const startDate: Date = startOfWeek(monthStart);
        const endDate: Date = endOfWeek(monthEnd);
        const dateFormat: string = "d";
        const rows: Array<any> = [];
        let days: Array<any> = [];
        let day: Date = startDate;
        let formattedDate: string = "";
        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                /* Filters out any day that's not the cloneDay's current day 
                    by slicing off what isn't needed and checking with the startTime*/
                let properDays: any = allRequests.filter((event: any) => event.startTime.includes(cloneDay.toISOString().slice(0, 10)))
                /* a div cell begin pushed into the calendar to display the events */
                days.push(
                    <div
                        className={`${styles.column} ${styles.cell} ${!isSameMonth(day, monthStart)
                            ? `${styles.disabled}` : isSameDay(day, selectedDate)
                                ? `${styles.selected}` : ""}`}
                        key={day.toDateString()}


                        onClick={() => onDateClick(parse("", "", cloneDay))}
                        style={{ overflowY: "auto" }}
                    >
                        <span className={styles.number}>{formattedDate}</span>
                        <br />
                        {/*If there is one or more events display the Modal */}
                        {properDays.length > 0 &&
                            /* Loading in the array of events */
                            <CalModal Events={properDays} />
                        }
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className={styles.row} key={day.toDateString()}> {days} </div>
            );
            days = [];
        }
        return <div className={styles.body}>{rows}</div>;
    }
    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };
    const prevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };
    const nextYear = () => {
        setCurrentDate(addYears(currentDate, 1));
    };
    const prevYear = () => {
        setCurrentDate(subYears(currentDate, 1));
    };
    const onDateClick = (day: Date) => {
        setSelectedDate(day);

    }
    return (
        <div>

            <div>{header()}</div>
            <div className={styles.calendar}>
                <div>{days()}</div>
                <div>{cells()}</div>
            </div>
        </div>
    );
}; 