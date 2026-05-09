async function checkSchema() {
  const url = "https://xcahyjgldytyvtpguinj.supabase.co/rest/v1/products?select=*&limit=1";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYWh5amdsZHl0eXZ0cGd1aW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjg3NDcsImV4cCI6MjA5Mzg0NDc0N30.KWv5h_F-3UWfUpqUy7ahz0NrwpAmzDO_g5vz9G4swmg";
  
  try {
    const res = await fetch(url, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Prefer": "count=exact"
      }
    });
    // Let's also check if there is a 'benefits' table
    const res2 = await fetch("https://xcahyjgldytyvtpguinj.supabase.co/rest/v1/product_benefits?select=*", {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    
    const data = await res.json();
    const benefits = await res2.json();
    
    console.log("Product fields:", Object.keys(data[0] || {}));
    console.log("Benefits table data:", benefits);
  } catch (e) {
    console.error(e);
  }
}
checkSchema();
