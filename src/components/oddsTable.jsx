// components/OddsTable.jsx
import React from 'react';

const OddsTable = ({ odds }) => {
  return (
    <div className="odds-table">
      <h3>Win & Place Odds</h3>
      <table>
        <thead>
          <tr>
            <th>Horse</th>
            <th>Win</th>
            <th>Place</th>
            <th>Win Probability</th>
          </tr>
        </thead>
        <tbody>
          {odds.map((horse) => (
            <tr key={horse.horse_number}>
              <td>#{horse.horse_number}</td>
              <td>{horse.win}</td>
              <td>{horse.place}</td>
              <td>{(1/parseFloat(horse.win)*100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OddsTable;