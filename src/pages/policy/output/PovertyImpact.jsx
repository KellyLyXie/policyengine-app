import { useState } from "react";
import Plot from "react-plotly.js";
import { ChartLogo } from "../../../api/charts";
import { percent } from "../../../api/language";
import HoverCard from "../../../layout/HoverCard";
import useMobile from "../../../layout/Responsive";
import style from "../../../style";

export default function PovertyImpact(props) {
  const { impact, policyLabel } = props;
  const childPovertyChange =
    impact.poverty.poverty.child.reform / impact.poverty.poverty.child.baseline - 1;
  const adultPovertyChange =
    impact.poverty.poverty.adult.reform / impact.poverty.poverty.adult.baseline - 1;
  const seniorPovertyChange =
    impact.poverty.poverty.senior.reform / impact.poverty.poverty.senior.baseline - 1;
  const totalPovertyChange =
    impact.poverty.poverty.all.reform / impact.poverty.poverty.all.baseline - 1;
  const povertyChanges = [
    childPovertyChange,
    adultPovertyChange,
    seniorPovertyChange,
    totalPovertyChange,
  ];
  const povertyLabels = ["Children", "Working-age adults", "Seniors", "All"];
  const labelToKey = {
    Children: "child",
    "Working-age adults": "adult",
    Seniors: "senior",
    All: "all",
  }
  const [hovercard, setHoverCard] = useState(null);
  const mobile = useMobile();
  // Decile bar chart. Bars are grey if negative, green if positive.
  const chart = (
    <Plot
      data={[
        {
          x: povertyLabels,
          y: povertyChanges,
          type: "bar",
          marker: {
            color: povertyChanges.map((value) =>
              value < 0 ? style.colors.DARK_GREEN : style.colors.DARK_GRAY
            ),
          },
          text: povertyChanges.map(
            (value) =>
              (value >= 0 ? "+" : "") +
              (value * 100).toFixed(1).toString() +
              "%"
          ),
          textangle: 0,
          hoverinfo: "none",
        },
      ]}
      layout={{
        xaxis: {
          title: "Age group",
        },
        yaxis: {
          title: "Relative change",
          tickformat: "+,.1%",
        },
        showlegend: false,
        uniformtext: {
          mode: "hide",
          minsize: 8,
        },
        ...ChartLogo,
        margin: {
          t: 0,
          b: 60,
        },
        height: mobile ? 300 : 450,
      }}
      config={{
        displayModeBar: false,
        responsive: true,
      }}
      style={{
        width: "100%",
      }}
      onHover={(data) => {
        const group = data.points[0].x;
        const change = data.points[0].y;
        const baseline = impact.poverty.poverty[labelToKey[group]].baseline;
        const reform = impact.poverty.poverty[labelToKey[group]].reform;
        const message =
          `The percentage of ${
            group === "All" ? 
              "people" : 
              group.toLowerCase()
          } in absolute poverty before housing costs ${
            change < -0.001 ? 
              `falls ${percent(-change)} from ${percent(baseline)} to ${percent(reform)}.` : 
              change > 0.001 ?
                `rises ${percent(change)} from ${percent(baseline)} to ${percent(reform)}.` :
                `remains at ${percent(baseline)}.`
          }`;
        setHoverCard({
          title: group,
          body: message,
        });
      }}
    />
  );

  const povertyRateChange = percent(Math.abs(totalPovertyChange));

  return (
    <>
      <h2>
        {policyLabel}{" "}
        {totalPovertyChange > 0
          ? `raises the poverty rate by ${povertyRateChange}`
          : totalPovertyChange < 0
          ? `reduces the poverty rate by ${povertyRateChange}`
          : "doesn't change the poverty rate"}
      </h2>
      <HoverCard
        content={hovercard}
      >
        {chart}
      </HoverCard>
      <p>
        The chart above shows the relative change in the poverty rate for each
        age group.
      </p>
    </>
  );
}
