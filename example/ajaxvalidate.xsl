<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:exsl="http://exslt.org/common"
    extension-element-prefixes="exsl"
    version="1.0" >
<!-- inclide needed utility scripts that create comment entries -->
  <xsl:import href="../utilities/get-comments.xsl"/>
  <xsl:import href="../utilities/date-time.xsl"/>  
  <xsl:output method="xml" encoding="UTF-8" indent="no" />
  <xsl:variable name="is-logged-in" select="false"/>

  <xsl:template match="/data">
    <data>
        <xsl:copy-of select="events" />
      <!-- store the current comment id -->       
        <xsl:variable name="submitid">
           <xsl:value-of select="events/comment-submit/@id" />
        </xsl:variable>
      <!-- store the submitted comment xml node -->           
        <xsl:variable name="select-comment">        
          <blog-comment>
            <xsl:copy-of select="blog-comment-ajax/section" />
            <xsl:for-each select="blog-comment-ajax/entry[@id=$submitid]">             
                 <xsl:copy-of select="."/>               
            </xsl:for-each>
          </blog-comment>              
        </xsl:variable>
        
      <!-- the result if submitted successfuly -->  
      <recent-comment>
        <xsl:apply-templates select="exsl:node-set($select-comment)/blog-comment"/>
      </recent-comment>
    </data>        
    </xsl:template>
</xsl:stylesheet>